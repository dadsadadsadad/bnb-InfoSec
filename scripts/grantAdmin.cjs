const fs = require('fs')
const path = require('path')
const admin = require('firebase-admin')

const svcPath = path.resolve(__dirname, '../serviceAccountKey.json')
if (!fs.existsSync(svcPath)) {
    console.error('Missing serviceAccountKey.json in project root.')
    process.exit(1)
}

admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(fs.readFileSync(svcPath, 'utf8')))
})

async function resolveUser(idOrEmail) {
    if (idOrEmail.includes('@')) return admin.auth().getUserByEmail(idOrEmail)
    return admin.auth().getUser(idOrEmail)
}

;(async () => {
    const id = process.argv[2]
    if (!id) {
        console.error('Usage: node scripts/grantAdmin.cjs <uid-or-email>')
        process.exit(1)
    }
    const user = await resolveUser(id)
    const existing = user.customClaims || {}
    await admin.auth().setCustomUserClaims(user.uid, { ...existing, admin: true })
    await admin.auth().revokeRefreshTokens(user.uid)
    console.log(`Granted admin to ${user.uid} (${user.email || 'no-email'})`)
})().catch((e) => {
    console.error(e)
    process.exit(1)
})