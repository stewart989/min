import express from 'express';
import crypto from 'crypto';
const router = express.Router();

// 用 KMS/密钥环境变量加密；演示用 AES-256-GCM
const KEY = Buffer.from(process.env.SETTINGS_ENC_KEY!, 'hex'); // 32 字节
function encrypt(text: string) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([c.update(text, 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64');
}

router.get('/settings/security', async (req, res) => {
  const s = await db.getSecuritySettings(req.user.orgId);   // 你的取数
  res.json({
    is2FaEnabled: s.is2FaEnabled,
    ssoEnabled: s.ssoEnabled,
    ssoEnforced: s.ssoEnforced,
    ssoProvider: s.ssoProvider,
    ssoIssuer: s.ssoIssuer,
    ssoClientId: s.ssoClientId,
    ssoClientSecretSet: !!s.ssoClientSecretEnc,  // 只回是否已配置
  });
});

router.put('/settings/security', async (req, res) => {
  // requirePermission(req, 'system.settings'); + 记审计
  const { ssoClientSecret, ...safe } = req.body;   // 拒绝从这个口写密钥
  await db.updateSecuritySettings(req.user.orgId, safe);
  res.json({ ok: true });
});

router.put('/settings/security/sso-secret', async (req, res) => {
  // requirePermission(req, 'system.settings'); + 记审计（不记明文）
  await db.updateSecuritySettings(req.user.orgId, {
    ssoClientSecretEnc: encrypt(req.body.clientSecret),
  });
  res.json({ ok: true });
});

export default router;
