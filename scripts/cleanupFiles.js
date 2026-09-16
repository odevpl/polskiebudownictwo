require('dotenv').config({ quiet: true });
const pool = require('../config/database');
const { cleanup } = require('../modules/files/cleanup');
cleanup().catch(error => { console.error('File cleanup failed:', error.code || error.name); process.exitCode = 1; }).finally(() => pool.end());
