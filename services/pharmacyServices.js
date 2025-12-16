const Pharmacy = require("../models/pharmacyModel");
const factory = require("./handlersFactory");

/**
 * Create Pharmacy
 * @router Post /api/v1/pharmacy
 * @access private/Pharmacy
 */

exports.createPharmacy = factory.createOne(Pharmacy);

/**
 * Get All Pharmacy
 * @router Post /api/v1/pharmacy
 * @access private/Pharmacy
 */

exports.getAllPharmacys = factory.getAll(Pharmacy);
/**
 * Get Specific Pharmacy
 * @router Post /api/v1/pharmacy/:id
 * @access private/Pharmacy
 */

exports.getSpecificPharmacy = factory.getOne(Pharmacy);
/**
 * Update Specific Pharmacy
 * @router Put /api/v1/pharmacy/:id
 * @access private/Pharmacy
 */

exports.updateSpecificPharmacy = factory.updateOne(Pharmacy);

/**
 * Delete Specific Pharmacy
 * @router delete /api/v1/pharmacy/:id
 * @access private/Pharmacy
 */

exports.deleteSpecificPharmacy = factory.deleteOne(Pharmacy);
