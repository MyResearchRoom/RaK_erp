const { Company,User,Receipts, Invoices,Materials,BoardOfDirectors,FarmerMembers,sequelize} = require('../models');
const { errorResponse, successResponse } = require('../utils/response');

exports.getCount = async (req, res) => {
  try {

    const { role, email} = req.user; 

    let companyId = null;

    if (role === "COMPANY") {
    const company = await Company.findOne({ where: { email } });

    if (!company) {
        return errorResponse(res, "Company not found", 404);
    }

        companyId = company.id; 
    }

    const whereCondition = companyId ? { companyId } : {};

    const totalCompanies = await Company.count();

    const totalInvoices = await Invoices.count({ where: whereCondition });

    const totalFarmerMembers = await FarmerMembers.count({ where: whereCondition });

    const totalBoardOfDirectors = await BoardOfDirectors.count({ where: whereCondition });

    const totalPaidInvoices = await Invoices.count({
    where: { ...whereCondition, status: "paid" }
    });

    const totalPartiallyPaidInvoices = await Invoices.count({
    where: { ...whereCondition, status: "partially paid" }
    });

    const totalPendingInvoices = await Invoices.count({
    where: { ...whereCondition, status: "pending" }
    });

    const totalOverdueInvoices = await Invoices.count({
    where: { ...whereCondition, status: "overdue" }
    });

    const totalReceipt = await Receipts.count({ where: whereCondition });

    const totalPaidAmount = (await Receipts.sum("amount", { where: whereCondition })) || 0;

    const lastReceipt = await Receipts.findOne({
        where: whereCondition,
        order: [["paymentDate", "DESC"]],
        attributes: ["paymentDate"],
    });

    const lastReceiptPaymentDate = lastReceipt?.paymentDate || null;

    successResponse(res, "Data retrieved successfully", {
        counts: {
            totalCompanies,
            totalInvoices,
            totalFarmerMembers,
            totalBoardOfDirectors,
            totalPaidInvoices,
            totalPartiallyPaidInvoices,
            totalPendingInvoices,
            totalOverdueInvoices,
            totalReceipt,
            totalPaidAmount,
            lastReceiptPaymentDate,
        
        },
    });
  } catch (error) {
    errorResponse(res, "Failed to get counts", 500);
  }
};