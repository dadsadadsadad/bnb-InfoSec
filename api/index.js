const admin = require('firebase-admin');

let app;
function initAdmin() {
    if (!app) {
        const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (!sa) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT');
        app = admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(sa)),
        });
    }
    return app;
}

function isAllowed(uid) {
    const raw = process.env.ADMIN_UIDS || '';
    const allow = raw.split(',').map(s => s.trim()).filter(Boolean);
    return allow.length === 0 ? true : allow.includes(uid);
}

module.exports = async (req, res) => {
    try {
        initAdmin();

        if (!['GET', 'POST'].includes(req.method)) {
            res.setHeader('Allow', 'GET, POST');
            return res.status(405).json({ error: 'Method Not Allowed' });
        }

        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
        if (!token) return res.status(401).json({ error: 'Missing bearer token' });

        const decoded = await admin.auth().verifyIdToken(token);
        if (!isAllowed(decoded.uid)) return res.status(403).json({ error: 'Forbidden' });

        return res.status(200).json({ ok: true, uid: decoded.uid });
    } catch (err) {
        console.error('Admin API error:', err);
        const code = String(err.code || '').startsWith('auth/') ? 401 : 500;
        return res.status(code).json({ error: err.message || 'Internal Server Error' });
    }
};