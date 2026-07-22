const pool = require('../config/database');

async function findByUserId(userId) {
  const [rows] = await pool.execute(
    `SELECT billing_type, company_name, nip, billing_email, street,
            building_number, apartment_number, postal_code, city, country
     FROM user_billing_details
     WHERE user_id = ?
     LIMIT 1`,
    [userId],
  );
  return rows[0] || {
    billing_type: 'company',
    company_name: '',
    nip: '',
    billing_email: '',
    street: '',
    building_number: '',
    apartment_number: '',
    postal_code: '',
    city: '',
    country: 'Polska',
  };
}

async function upsert(userId, data) {
  await pool.execute(
    `INSERT INTO user_billing_details
       (user_id, billing_type, company_name, nip, billing_email, street,
        building_number, apartment_number, postal_code, city, country)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       billing_type = VALUES(billing_type),
       company_name = VALUES(company_name),
       nip = VALUES(nip),
       billing_email = VALUES(billing_email),
       street = VALUES(street),
       building_number = VALUES(building_number),
       apartment_number = VALUES(apartment_number),
       postal_code = VALUES(postal_code),
       city = VALUES(city),
       country = VALUES(country)`,
    [
      userId,
      data.billingType,
      data.companyName || null,
      data.nip || null,
      data.billingEmail || null,
      data.street || null,
      data.buildingNumber || null,
      data.apartmentNumber || null,
      data.postalCode || null,
      data.city || null,
      data.country || 'Polska',
    ],
  );
}

module.exports = { findByUserId, upsert };
