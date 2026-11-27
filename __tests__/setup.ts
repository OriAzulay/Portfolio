import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Isolated database + secrets for every test file - never touches data/portfolio.db.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-test-"));
process.env.DATABASE_PATH = path.join(dir, "test.db");
process.env.SESSION_SECRET = "test-session-secret-0123456789abcdef0123456789";
process.env.ADMIN_PASSWORD = "test-admin-password";
delete process.env.RESEND_API_KEY; // never send real email from tests
