/**
 * خادم «على قدّك» على Cloudflare Workers.
 *
 * - /api/auth/*       فتح حساب بالبريد وكلمة المرور، الدخول، الخروج، تغيير كلمة المرور.
 * - /api/state        بيانات كل مستخدم (ملفه، خطته، مشترياته، تقدّمه) محفوظة في قاعدة D1.
 * - /api/account      حذف الحساب نهائياً.
 * - /api/admin/*       للمدير فقط: قائمة المستخدمين، وإنشاء رابط استرجاع كلمة المرور.
 * - /api/assistant/*  «كابتن على قدّك»: ردود جاهزة داخل الخادم، ويستعمل Gemini فقط إذا أُضيف
 *                     المفتاح GEMINI_API_KEY كسرّ في Cloudflare (غير مفعّل افتراضياً).
 * - كل ما عدا ذلك: واجهة التطبيق من مجلد dist.
 *
 * كلمات المرور لا تُخزَّن أبداً كما هي: تُشفَّر باتجاه واحد (PBKDF2-SHA256 مع ملح عشوائي لكل مستخدم).
 * جلسة الدخول رمز عشوائي في كعكة HttpOnly، ولا يُخزَّن في القاعدة إلا بصمته.
 */

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  /** اختياري: مفتاح Gemini لتفعيل الردود الذكية. بدونه يعمل الكابتن بالردود الجاهزة. */
  GEMINI_API_KEY?: string;
  /** اختياري: اسم نموذج Gemini. */
  GEMINI_MODEL?: string;
  /** اختياري: بريد أو أكثر (مفصولة بفواصل) يظهر لأصحابها زر لوحة الإدارة. */
  ADMIN_EMAILS?: string;
  /** بصمات SHA-256 لبريد المدير (مفصولة بفواصل)، حتى لا يظهر البريد نفسه في المستودع العام. */
  ADMIN_EMAIL_HASHES?: string;
}

const SESSION_COOKIE = 'aq_session';
const SESSION_DAYS = 60;
const PBKDF2_ITERATIONS = 100_000; // أقصى ما تسمح به Workers
const MAX_STATE_BYTES = 512 * 1024;
const LOGIN_WINDOW_MIN = 15;
const LOGIN_MAX_PER_IP = 20;
const LOGIN_MAX_PER_EMAIL = 8;
const REGISTER_MAX_PER_IP_PER_HOUR = 10;
const CHAT_MAX_PER_HOUR = 40;
const RESET_LINK_MINUTES = 60;

// ───────────────────────── أدوات عامة ─────────────────────────

const SECURITY_HEADERS: Record<string, string> = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-frame-options': 'DENY',
};

function json(data: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...SECURITY_HEADERS,
      ...extra,
    },
  });
}

function fail(message: string, status = 400): Response {
  return json({ error: message }, status);
}

const enc = new TextEncoder();

function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return out;
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function randomHex(bytes: number): string {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

async function sha256(text: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(text)));
}

async function pbkdf2(password: string, saltHex: string, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex), iterations },
    key,
    256,
  );
  return toHex(bits);
}

/** مقارنة بزمن ثابت حتى لا يُستنتج شيء من سرعة الرد. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function getCookie(req: Request, name: string): string | null {
  const header = req.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return rest.join('=');
  }
  return null;
}

function sessionCookie(req: Request, value: string, maxAgeSec: number): string {
  const secure = new URL(req.url).protocol === 'https:' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`;
}

function clientIp(req: Request): string {
  return req.headers.get('cf-connecting-ip') || 'local';
}

function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const email = raw.trim().toLowerCase();
  if (email.length > 254) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : null;
}

function validatePassword(raw: unknown): string | null {
  if (typeof raw !== 'string') return 'اكتب كلمة المرور.';
  if (raw.length < 8) return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.';
  if (raw.length > 200) return 'كلمة المرور طويلة جداً.';
  return null;
}

function cleanName(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/\s+/g, ' ').trim().slice(0, 60);
}

/** يمنع الطلبات المغيِّرة القادمة من مواقع أخرى (حماية إضافية فوق SameSite). */
function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // بعض المتصفحات لا ترسله في طلبات نفس الموقع
  return origin === new URL(req.url).origin;
}

async function readJson<T>(req: Request, limit = 16 * 1024): Promise<T | null> {
  const text = await req.text();
  if (text.length > limit) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

// ───────────────────────── قاعدة البيانات ─────────────────────────

let schemaReady: Promise<void> | null = null;

function ensureSchema(env: Env): Promise<void> {
  if (!schemaReady) {
    schemaReady = env.DB.batch([
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        pass_hash TEXT NOT NULL,
        pass_salt TEXT NOT NULL,
        pass_iter INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      )`),
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      )`),
      env.DB.prepare('CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id)'),
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_state (
        user_id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )`),
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS rate_events (
        bucket TEXT NOT NULL,
        at INTEGER NOT NULL
      )`),
      env.DB.prepare('CREATE INDEX IF NOT EXISTS rate_events_bucket ON rate_events(bucket, at)'),
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS password_resets (
        token_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        used_at INTEGER
      )`),
    ]).then(() => undefined).catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  pass_hash: string;
  pass_salt: string;
  pass_iter: number;
  created_at: number;
}

/** يسجّل حدثاً ويرجع true إذا تجاوز الحد خلال النافذة الزمنية. */
async function overLimit(env: Env, bucket: string, windowMin: number, max: number, record = true): Promise<boolean> {
  const since = Date.now() - windowMin * 60_000;
  const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM rate_events WHERE bucket = ? AND at > ?')
    .bind(bucket, since)
    .first<{ n: number }>();
  if ((row?.n ?? 0) >= max) return true;
  if (record) await env.DB.prepare('INSERT INTO rate_events (bucket, at) VALUES (?, ?)').bind(bucket, Date.now()).run();
  return false;
}

async function createSession(env: Env, req: Request, userId: string): Promise<string> {
  const token = randomHex(32);
  const now = Date.now();
  await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .bind(await sha256(token), userId, now + SESSION_DAYS * 86_400_000, now)
    .run();
  return sessionCookie(req, token, SESSION_DAYS * 86_400);
}

async function currentUser(env: Env, req: Request): Promise<UserRow | null> {
  const token = getCookie(req, SESSION_COOKIE);
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const row = await env.DB.prepare(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ?`,
  )
    .bind(await sha256(token), Date.now())
    .first<UserRow>();
  return row ?? null;
}

const splitList = (v?: string) =>
  (v || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

async function isAdmin(env: Env, email: string): Promise<boolean> {
  if (splitList(env.ADMIN_EMAILS).includes(email)) return true;
  const hashes = splitList(env.ADMIN_EMAIL_HASHES);
  return hashes.length > 0 && hashes.includes(await sha256(email));
}

async function publicUser(env: Env, u: UserRow) {
  return { id: u.id, email: u.email, name: u.name, isAdmin: await isAdmin(env, u.email), createdAt: u.created_at };
}

// ───────────────────────── الحسابات ─────────────────────────

async function register(req: Request, env: Env): Promise<Response> {
  const body = await readJson<{ name?: string; email?: string; password?: string }>(req);
  if (!body) return fail('طلب غير صالح.');

  const name = cleanName(body.name);
  const email = normalizeEmail(body.email);
  if (!name) return fail('اكتب اسمك.');
  if (!email) return fail('البريد الإلكتروني غير صحيح.');
  const pwError = validatePassword(body.password);
  if (pwError) return fail(pwError);

  if (await overLimit(env, `reg:${clientIp(req)}`, 60, REGISTER_MAX_PER_IP_PER_HOUR)) {
    return fail('محاولات كثيرة من هذا الجهاز. حاول بعد قليل.', 429);
  }

  const exists = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (exists) return fail('هذا البريد مسجّل من قبل. ادخل بحسابك بدلاً من فتح حساب جديد.', 409);

  const salt = randomHex(16);
  const hash = await pbkdf2(body.password as string, salt, PBKDF2_ITERATIONS);
  const id = crypto.randomUUID();
  const now = Date.now();
  try {
    await env.DB.prepare(
      'INSERT INTO users (id, email, name, pass_hash, pass_salt, pass_iter, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(id, email, name, hash, salt, PBKDF2_ITERATIONS, now)
      .run();
  } catch {
    return fail('هذا البريد مسجّل من قبل. ادخل بحسابك بدلاً من فتح حساب جديد.', 409);
  }

  const cookie = await createSession(env, req, id);
  const user: UserRow = { id, email, name, pass_hash: hash, pass_salt: salt, pass_iter: PBKDF2_ITERATIONS, created_at: now };
  return json({ user: await publicUser(env, user), isNew: true }, 201, { 'set-cookie': cookie });
}

async function login(req: Request, env: Env): Promise<Response> {
  const body = await readJson<{ email?: string; password?: string }>(req);
  if (!body) return fail('طلب غير صالح.');
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password) return fail('اكتب البريد وكلمة المرور.');

  const ip = clientIp(req);
  if (
    (await overLimit(env, `login-ip:${ip}`, LOGIN_WINDOW_MIN, LOGIN_MAX_PER_IP, false)) ||
    (await overLimit(env, `login-mail:${email}`, LOGIN_WINDOW_MIN, LOGIN_MAX_PER_EMAIL, false))
  ) {
    return fail(`محاولات دخول كثيرة. انتظر ${LOGIN_WINDOW_MIN} دقيقة ثم حاول مجدداً.`, 429);
  }

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<UserRow>();
  // نحسب التشفير حتى لو لم يوجد الحساب، حتى لا يكشف زمن الرد وجود البريد.
  const hash = await pbkdf2(password, user?.pass_salt ?? '00'.repeat(16), user?.pass_iter ?? PBKDF2_ITERATIONS);
  if (!user || !safeEqual(hash, user.pass_hash)) {
    await env.DB.batch([
      env.DB.prepare('INSERT INTO rate_events (bucket, at) VALUES (?, ?)').bind(`login-ip:${ip}`, Date.now()),
      env.DB.prepare('INSERT INTO rate_events (bucket, at) VALUES (?, ?)').bind(`login-mail:${email}`, Date.now()),
    ]);
    return fail('البريد أو كلمة المرور غير صحيحة.', 401);
  }

  const cookie = await createSession(env, req, user.id);
  return json({ user: await publicUser(env, user) }, 200, { 'set-cookie': cookie });
}

async function logout(req: Request, env: Env): Promise<Response> {
  const token = getCookie(req, SESSION_COOKIE);
  if (token && /^[0-9a-f]{64}$/.test(token)) {
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
  }
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie(req, '', 0) });
}

async function changePassword(req: Request, env: Env, user: UserRow): Promise<Response> {
  const body = await readJson<{ current?: string; next?: string }>(req);
  if (!body) return fail('طلب غير صالح.');
  if (await overLimit(env, `pw:${user.id}`, LOGIN_WINDOW_MIN, LOGIN_MAX_PER_EMAIL)) {
    return fail('محاولات كثيرة. حاول بعد قليل.', 429);
  }
  const currentHash = await pbkdf2(body.current || '', user.pass_salt, user.pass_iter);
  if (!safeEqual(currentHash, user.pass_hash)) return fail('كلمة المرور الحالية غير صحيحة.', 401);
  const pwError = validatePassword(body.next);
  if (pwError) return fail(pwError);

  const salt = randomHex(16);
  const hash = await pbkdf2(body.next as string, salt, PBKDF2_ITERATIONS);
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET pass_hash = ?, pass_salt = ?, pass_iter = ? WHERE id = ?').bind(
      hash,
      salt,
      PBKDF2_ITERATIONS,
      user.id,
    ),
    // نُخرج كل الأجهزة الأخرى، ونُبقي هذا الجهاز داخلاً بجلسة جديدة.
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id),
  ]);
  const cookie = await createSession(env, req, user.id);
  return json({ ok: true }, 200, { 'set-cookie': cookie });
}

async function updateName(req: Request, env: Env, user: UserRow): Promise<Response> {
  const body = await readJson<{ name?: string }>(req);
  const name = cleanName(body?.name);
  if (!name) return fail('اكتب اسمك.');
  await env.DB.prepare('UPDATE users SET name = ? WHERE id = ?').bind(name, user.id).run();
  return json({ user: await publicUser(env, { ...user, name }) });
}

async function deleteAccount(req: Request, env: Env, user: UserRow): Promise<Response> {
  const body = await readJson<{ password?: string }>(req);
  const hash = await pbkdf2(body?.password || '', user.pass_salt, user.pass_iter);
  if (!safeEqual(hash, user.pass_hash)) return fail('كلمة المرور غير صحيحة.', 401);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM user_state WHERE user_id = ?').bind(user.id),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id),
    env.DB.prepare('DELETE FROM users WHERE id = ?').bind(user.id),
  ]);
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie(req, '', 0) });
}

// ───────────────────────── استرجاع كلمة المرور ─────────────────────────
// لا يوجد إرسال بريد: المدير ينشئ رابطاً صالحاً لساعة ولمرة واحدة، ويرسله للمستخدم بنفسه.

async function adminListUsers(env: Env): Promise<Response> {
  const rows = await env.DB.prepare(
    `SELECT u.id, u.email, u.name, u.created_at, s.updated_at AS last_saved
     FROM users u LEFT JOIN user_state s ON s.user_id = u.id
     ORDER BY u.created_at DESC LIMIT 500`,
  ).all<{ id: string; email: string; name: string; created_at: number; last_saved: number | null }>();
  return json({
    users: rows.results.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      createdAt: r.created_at,
      lastSavedAt: r.last_saved,
    })),
  });
}

async function adminResetLink(req: Request, env: Env): Promise<Response> {
  const body = await readJson<{ userId?: string }>(req);
  if (!body?.userId) return fail('طلب غير صالح.');
  const target = await env.DB.prepare('SELECT id, email, name FROM users WHERE id = ?')
    .bind(body.userId)
    .first<{ id: string; email: string; name: string }>();
  if (!target) return fail('المستخدم غير موجود.', 404);

  const token = randomHex(32);
  const expiresAt = Date.now() + RESET_LINK_MINUTES * 60_000;
  await env.DB.batch([
    // رابط واحد فعّال لكل مستخدم: نلغي الروابط السابقة
    env.DB.prepare('DELETE FROM password_resets WHERE user_id = ? AND used_at IS NULL').bind(target.id),
    env.DB.prepare('INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (?, ?, ?)').bind(
      await sha256(token),
      target.id,
      expiresAt,
    ),
  ]);
  const url = `${new URL(req.url).origin}/?reset=${token}`;
  return json({ url, expiresAt, name: target.name, email: target.email });
}

async function checkReset(env: Env, url: URL): Promise<Response> {
  const token = url.searchParams.get('token') || '';
  if (!/^[0-9a-f]{64}$/.test(token)) return fail('الرابط غير صالح.', 400);
  const row = await env.DB.prepare(
    `SELECT u.name, u.email FROM password_resets r JOIN users u ON u.id = r.user_id
     WHERE r.token_hash = ? AND r.used_at IS NULL AND r.expires_at > ?`,
  )
    .bind(await sha256(token), Date.now())
    .first<{ name: string; email: string }>();
  if (!row) return fail('انتهت صلاحية هذا الرابط أو استُعمل من قبل. اطلب رابطاً جديداً.', 410);
  return json({ name: row.name, email: row.email });
}

async function completeReset(req: Request, env: Env): Promise<Response> {
  const body = await readJson<{ token?: string; password?: string }>(req);
  const token = body?.token || '';
  if (!/^[0-9a-f]{64}$/.test(token)) return fail('الرابط غير صالح.');
  const pwError = validatePassword(body?.password);
  if (pwError) return fail(pwError);
  if (await overLimit(env, `reset-ip:${clientIp(req)}`, LOGIN_WINDOW_MIN, LOGIN_MAX_PER_IP)) {
    return fail('محاولات كثيرة. حاول بعد قليل.', 429);
  }

  const tokenHash = await sha256(token);
  const row = await env.DB.prepare(
    'SELECT user_id FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?',
  )
    .bind(tokenHash, Date.now())
    .first<{ user_id: string }>();
  if (!row) return fail('انتهت صلاحية هذا الرابط أو استُعمل من قبل. اطلب رابطاً جديداً.', 410);

  const salt = randomHex(16);
  const hash = await pbkdf2(body!.password as string, salt, PBKDF2_ITERATIONS);
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET pass_hash = ?, pass_salt = ?, pass_iter = ? WHERE id = ?').bind(
      hash,
      salt,
      PBKDF2_ITERATIONS,
      row.user_id,
    ),
    env.DB.prepare('UPDATE password_resets SET used_at = ? WHERE token_hash = ?').bind(Date.now(), tokenHash),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(row.user_id),
  ]);
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(row.user_id).first<UserRow>();
  const cookie = await createSession(env, req, row.user_id);
  return json({ user: await publicUser(env, user!) }, 200, { 'set-cookie': cookie });
}

// ───────────────────────── بيانات المستخدم ─────────────────────────

async function getState(env: Env, user: UserRow): Promise<Response> {
  const row = await env.DB.prepare('SELECT data, updated_at FROM user_state WHERE user_id = ?')
    .bind(user.id)
    .first<{ data: string; updated_at: number }>();
  return json({ data: row ? JSON.parse(row.data) : null, updatedAt: row?.updated_at ?? null });
}

async function putState(req: Request, env: Env, user: UserRow): Promise<Response> {
  const text = await req.text();
  if (text.length > MAX_STATE_BYTES) return fail('حجم البيانات أكبر من المسموح.', 413);
  let parsed: { data?: unknown };
  try {
    parsed = JSON.parse(text);
  } catch {
    return fail('طلب غير صالح.');
  }
  if (!parsed || typeof parsed.data !== 'object' || parsed.data === null || Array.isArray(parsed.data)) {
    return fail('طلب غير صالح.');
  }
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO user_state (user_id, data, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
  )
    .bind(user.id, JSON.stringify(parsed.data), now)
    .run();
  return json({ ok: true, updatedAt: now });
}

// ───────────────────────── كابتن على قدّك ─────────────────────────

function offlineReply(lastUserMsg: string): string {
  const has = (...words: string[]) => words.some((w) => lastUserMsg.includes(w));
  if (has('أرخص', 'ميزانية', 'فلوس', 'سعر', 'غالي')) {
    return 'لتوفير الميزانية: ركّز على مصادر البروتين الاقتصادية مثل البيض، والعدس، والفول، وصدور الدجاج الكاملة بدلاً من الفيليه الجاهز، والتونة وقت العروض. استعمل زر «أرخص» في جدول الأكل لاستبدال أي وجبة بخيار أوفر.';
  }
  if (has('ألم', 'وجع', 'ركبتي', 'ظهري', 'دوخة', 'كتفي')) {
    return 'سلامتك أولاً. إذا كان الألم حاداً أو غير معتاد، أوقف التمرين فوراً، وراجع طبيباً إذا استمر. يمكنك استبدال التمرين ببديل أخف لا يضغط على المفصل من «دليل التمارين»، أو تقليل المدى الحركي والوزن. لا تتمرن فوق الألم الحاد أبداً.';
  }
  if (has('وقتي', 'مستعجل', 'سريع', 'وقت')) {
    return 'إذا كان وقتك ضيقاً اليوم، فاكتفِ بأول تمرينين في الحصة مع الإحماء، أو اختر «المشي» من نوع التمرين لحصة أقصر. 20 دقيقة أفضل من لا شيء.';
  }
  if (has('جهاز', 'بديل', 'مشغول', 'البيت', 'المنزل')) {
    return 'إذا كان الجهاز مشغولاً أو كنت في البيت، افتح «دليل التمارين»: لكل تمرين بديل بالأوزان الحرة أو بوزن الجسم يعمل على العضلات نفسها تقريباً.';
  }
  if (has('بروتين', 'سعرات', 'أكل', 'وجبة', 'غذاء')) {
    return 'قاعدة عملية: اجعل في كل وجبة مصدر بروتين واضحاً (بيض، بقوليات، دجاج، تونة، لبن)، ونصف الطبق خضار، وحصة نشويات بحجم قبضة اليد. جدول أكلك مبني على هذا وعلى أسعار بلدك.';
  }
  return 'أنا «كابتن على قدّك». أساعدك في خطة الأكل حسب ميزانيتك، وفي تمارينك حسب مستواك ووقتك. اسألني مثلاً: «أريد غداءً أرخص»، أو «ما بديل هذا الجهاز؟»، أو «وقتي قليل اليوم».';
}

const COACH_RULES = `أنت «كابتن على قدّك»، المدرب والمساعد في منصة «على قدّك» (غذاؤك حسب ميزانيتك، وتمرينك حسب مستواك).
- تحدّث بعربية فصحى بسيطة ومشجعة، دون لوم أو مبالغة.
- في الأكل والميزانية: اقترح حلولاً اقتصادية بمكونات شعبية متوفرة مع تقديرات عملية.
- أثناء التمرين: جملة أو جملتان فقط.
- عند ذكر ألم حاد أو دوخة: اطلب إيقاف التمرين ومراجعة طبيب إن استمر، ولا تشخّص.
- لا تعد بنتائج سحرية، واشرح سبب اقتراحك باختصار.`;

async function coachChat(req: Request, env: Env, user: UserRow): Promise<Response> {
  const body = await readJson<{ messages?: { role: string; content: string }[]; userContext?: unknown }>(req, 32 * 1024);
  if (!body || !Array.isArray(body.messages)) return fail('طلب غير صالح.');

  const messages = body.messages
    .filter((m) => m && typeof m.content === 'string')
    .slice(-12)
    .map((m) => ({ role: m.role === 'user' ? 'user' : 'model', text: m.content.slice(0, 1500) }));
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.text || '';

  if (await overLimit(env, `chat:${user.id}`, 60, CHAT_MAX_PER_HOUR)) {
    return json({ reply: 'وصلت للحد المسموح من الأسئلة في هذه الساعة. عد بعد قليل وسأكون هنا.', source: 'limit' });
  }

  if (env.GEMINI_API_KEY) {
    try {
      const context = JSON.stringify(body.userContext ?? {}).slice(0, 2000);
      const model = env.GEMINI_MODEL || 'gemini-3.8-flash';
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: `${COACH_RULES}\n\nسياق المستخدم:\n${context}` }] },
          contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
          generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
        const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim();
        if (text) return json({ reply: text, source: 'gemini' });
      }
    } catch {
      // نكمل بالردود الجاهزة
    }
  }

  return json({ reply: offlineReply(lastUser), source: 'offline_coach' });
}

// ───────────────────────── التوجيه ─────────────────────────

async function handleApi(req: Request, env: Env, url: URL): Promise<Response> {
  await ensureSchema(env);
  const { pathname } = url;
  const method = req.method;

  if (method !== 'GET' && !sameOrigin(req)) return fail('طلب مرفوض.', 403);

  if (pathname === '/api/health') return json({ status: 'ok' });

  if (pathname === '/api/auth/register' && method === 'POST') return register(req, env);
  if (pathname === '/api/auth/login' && method === 'POST') return login(req, env);
  if (pathname === '/api/auth/logout' && method === 'POST') return logout(req, env);
  if (pathname === '/api/auth/reset' && method === 'GET') return checkReset(env, url);
  if (pathname === '/api/auth/reset' && method === 'POST') return completeReset(req, env);

  const user = await currentUser(env, req);

  if (pathname === '/api/auth/me' && method === 'GET') {
    return user ? json({ user: await publicUser(env, user) }) : json({ user: null }, 401);
  }
  if (!user) return fail('سجّل الدخول أولاً.', 401);

  if (pathname === '/api/auth/password' && method === 'POST') return changePassword(req, env, user);
  if (pathname === '/api/account/name' && method === 'POST') return updateName(req, env, user);
  if (pathname === '/api/account/delete' && method === 'POST') return deleteAccount(req, env, user);
  if (pathname === '/api/state' && method === 'GET') return getState(env, user);
  if (pathname === '/api/state' && method === 'PUT') return putState(req, env, user);
  if (pathname === '/api/assistant/chat' && method === 'POST') return coachChat(req, env, user);

  if (pathname.startsWith('/api/admin/')) {
    if (!(await isAdmin(env, user.email))) return fail('هذه الصفحة للمدير فقط.', 403);
    if (pathname === '/api/admin/users' && method === 'GET') return adminListUsers(env);
    if (pathname === '/api/admin/reset-link' && method === 'POST') return adminResetLink(req, env);
  }

  return fail('غير موجود.', 404);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(req, env, url);
      } catch (err) {
        console.error('API error', url.pathname, err);
        return fail('حدث خطأ في الخادم. حاول مرة أخرى.', 500);
      }
    }
    return env.ASSETS.fetch(req);
  },

  /** تنظيف يومي للجلسات المنتهية وسجلات الحد من المحاولات. */
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    await ensureSchema(env);
    const now = Date.now();
    await env.DB.batch([
      env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now),
      env.DB.prepare('DELETE FROM rate_events WHERE at < ?').bind(now - 2 * 86_400_000),
      env.DB.prepare('DELETE FROM password_resets WHERE expires_at < ?').bind(now - 86_400_000),
    ]);
  },
} satisfies ExportedHandler<Env>;
