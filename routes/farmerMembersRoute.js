const { Router } = require("express");
const { validateRequest } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const { addFarmerMemberValidation, editFarmerMemberValidation } = require("../validation/farmerMemberValidation");
const { addFarmerMember, getFarmerMembers, getFarmerMemberById, deleteFarmerMember, editFarmerMember, uploadFarmers } = require("../controller/farmerMember");
const {upload} = require("../middleware/upload");

const router = Router();

router.post(
    "/add/:id", 
    authenticate(["ADMIN","EMPLOYEE"]),
    upload.none(),
    addFarmerMemberValidation,
    validateRequest,
    addFarmerMember,
);

router.get(
    "/farmer-list/:id",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getFarmerMembers,
);

router.get(
    "/:id",
    authenticate(["ADMIN","EMPLOYEE",,"COMPANY"]),
    getFarmerMemberById,
);

router.delete(
  "/delete/:id",
  authenticate(["ADMIN","EMPLOYEE"]),
  deleteFarmerMember
);

router.patch(
    "/edit/:id", 
    authenticate(["ADMIN","EMPLOYEE"]),
    editFarmerMemberValidation, 
    validateRequest, 
    editFarmerMember,
);

router.post(
    "/upload-farmers/:id", 
    upload.single("file"), 
    uploadFarmers,
);

module.exports = router;