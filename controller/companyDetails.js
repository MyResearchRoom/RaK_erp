const { Company, CompanyDetails, CompanyDocuments, sequelize} = require('../models');
const bcrypt = require("bcryptjs");
const { errorResponse, successResponse } = require('../utils/response');
const { Op, where } = require('sequelize');
const { validateQueryParams } = require('../utils/validateQueryParams');

const companyProfileEditAllowedFields = [
  "fpoUniqueCode",

  "dateOfStartActivities",
  "nameApprovalDate",
  "moaAoAPrepDate",
  "registrationDate",
  "incorporationDate",
  "cinNumber",
  "panNumber",
  "tanNumber",
  "gstApplicationDate",
  "gstNumber",
  "gstCertificateIssueDate",

  "bankName",
  "accountNumber",
  "ifscCode",
  "accountOpeningDate",
  "inc20aSubmission",
  "firstAgmConducted",
  "stationeryPrepared",
  "caAuditorName",
  "caContactNumber",
  "caEmail",

  "ceoName",
  "ceoContact",
  "ceoEmail",
  "ceoAppointmentDate",
  "accountantName",
  "accountantContact",
  "accountantEmail",
  "accountantAppointmentDate",

  "totalShareholderFarmers",
  "totalLandholdingAcres",
  "maleMembers",
  "femaleMembers",
  "marginalFarmers",
  "smallFarmers",
  "semiMediumFarmers",
  "mediumFarmers",
  "largeFarmers",

  "authorizedShareCapital",
  "totalShareCapitalRaised",
  "totalPaidUpCapital",

  "shopLocation",
  "tehsil",
  "district",
  "shopPincode",
  "areaOfShopSqFt",
  "distanceFromCompetitionKm",
  "latitude",
  "longitude",

  "seedLicenseNumber",
  "seedValidity",
  "fertilizerValidity",
  "fertilizerLicenseNumber",
  "pesticideLicenseNumber",
  "mandiLicenseNumber",
  "pesticideValidity",
  "mandiValidity",
  "udyamAadhaarNumber",
  "udyamIssueDate",

  "mandiName",
  "mandiLocation",
  "mandiDistrict",
  "mandiLatitude",
  "mandiLongitude",
  "purchaseCentreLocation",
  "purchaseCentreAreaSqFt",
  "purchaseCentreDistanceFromMandiKm",
  "warehouseLocation",
  "warehouseAreaSqFt",

  "digitalMoistureMeter",
  "hlMeter",
  "bambooSampler",
  "weighingScale100kg",
  "weighingScale500g",
  "otherEquipment",

  "laptopDesktopAvailable",
  "internetConnectivity",
  "printerAvailable",

  "businessPlanPrepared",
  "vendorRegistered"
];

exports.addCompanyDetails = async(req,res)=>{
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
    
        const files = req.files || [];
        const docIds = req.body.docIds || [];
        const docIdsArray = Array.isArray(docIds) ? docIds : [docIds];

        if (!id) {
        await transaction.rollback();
        return errorResponse(res, "Company id is required", 400);
        }

        const company = await Company.findByPk(id, { transaction });

        if (!company) {
            await transaction.rollback();
            return errorResponse(res, "Company not found", 404);
        }

        const existingDetails = await CompanyDetails.findOne({
            where: { companyId: id },
            transaction,
        });

        if (existingDetails) {
            await transaction.rollback();
            return errorResponse(res, "Company profile already completed, You can edit profile", 400);
        }

        const companyProfile = await CompanyDetails.create(
            {
                ...req.body,
                companyId:id,
            },
            { transaction }
        )

        const documentsData =
            files.length > 0
                ? files.map((f, index) => ({
                    companyDetailId: companyProfile.id,
                    companyId: id,
                    docName: docIdsArray[index],
                    doc: f.buffer,
                    docContentType: f.mimetype,
                }))
                : [];

        if (documentsData?.length)
        await CompanyDocuments.bulkCreate(documentsData, { transaction });

        await company.update(
            { status: "active" },
            { transaction }
        );

        await transaction.commit();
        
        return successResponse(res, "Company profile completed successfully", companyProfile);
    
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        return errorResponse(res, "Failed to complete company profile", 500);
    }
}

exports.editCompoamnyDetails = async (req,res) =>{
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        const files = req.files || [];
        const docIds = req.body.docIds || [];
        const docIdsArray = Array.isArray(docIds) ? docIds : [docIds];

        if (!id) {
        await transaction.rollback();
        return errorResponse(res, "Company id is required", 400);
        }

        const company = await Company.findByPk(id, { transaction });

        if (!company) {
            await transaction.rollback();
            return errorResponse(res, "Company not found", 404);
        }

        const companyDetails = await CompanyDetails.findOne({
            where: { companyId: id },
            transaction,
        });

        if (!companyDetails) {
            await transaction.rollback();
            return errorResponse(res, "Company profile not found or not completed yet", 400);
        }

        let updateData = {};

        companyProfileEditAllowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
        });

        await companyDetails.update(updateData,{transaction});

        // if (files.length > 0) {
        //     await CompanyDocuments.destroy({
        //         where: { companyDetailId: companyDetails.id },
        //         transaction,
        //     });

        //     const documentsData =
        //     files.length > 0
        //         ? files.map((f, index) => ({
        //             companyDetailId: companyDetails.id,
        //             companyId: id,
        //             docName: docIdsArray[index],
        //             doc: f.buffer,
        //             docContentType: f.mimetype,
        //         }))
        //         : [];

        //     if (documentsData?.length)
        //     await CompanyDocuments.bulkCreate(documentsData, { transaction });
        // }

        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const docName = docIdsArray[i];

                await CompanyDocuments.destroy({
                where: {
                    companyDetailId: companyDetails.id,
                    docName: docName,
                },
                transaction,
                });

                await CompanyDocuments.create(
                {
                    companyDetailId: companyDetails.id,
                    companyId: id,
                    docName: docName,
                    doc: file.buffer,
                    docContentType: file.mimetype,
                },
                { transaction }
                );
            }
        }

        await transaction.commit();

        return successResponse(res, "Company profile updated successfully", companyDetails);
    } catch (error) {
        await transaction.rollback();
        console.log(error);
        return errorResponse(res, "Failed to edit company", 500);
    }

}

exports.getCompanyProfileById = async (req,res)=>{
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "Company id is required", 400);
        }

        const companyProfile = await CompanyDetails.findOne({
            where:{companyId:id},
        });

        if(!companyProfile){
            return errorResponse(res, "Company profile not found", 404);
        }

        const companyDocuments = await CompanyDocuments.findAll({
            where:{companyId:id},
        });

        const documentsWithBase64 = companyDocuments.map((doc) => {
            return {
                id: doc.id,
                docName: doc.docName,
                docContentType: doc.docContentType,
                file: doc.doc
                ? `data:${doc.docContentType};base64,${doc.doc.toString("base64")}`
                : null,
            };
        });

        const responseData = {
            ...companyProfile.toJSON(),
            documents: documentsWithBase64,
        };


        return successResponse(res, "Company profile fetched successfully", responseData);


    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to fetch company", 500);
    }
};
