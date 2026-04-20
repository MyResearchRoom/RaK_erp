const { Router } = require("express");
const { validateRequest } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const { boardOfDirectorValidation, editBoardOfDirectorValidation } = require("../validation/boardOfDirectorsValidations");
const { addBoardOfDirector, getBoardOfDirectors, deleteBoardOfDirector, editBoardOfDirector, getBoardOfDirectorById, uploadBoardOfDirectors } = require("../controller/boardOfDirectorsManagmentController");
const { upload } = require("../middleware/upload");

const router = Router();

router.post(
    "/add/:id", 
    authenticate(["ADMIN","EMPLOYEE"]),
    upload.none(),
    boardOfDirectorValidation,
    validateRequest,
    addBoardOfDirector,
);

router.get(
    "/director-list/:id",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getBoardOfDirectors,
);

router.get(
    "/:id",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getBoardOfDirectorById,
);

router.delete(
  "/delete/:id",
  authenticate(["ADMIN","EMPLOYEE"]),
  deleteBoardOfDirector
);

router.patch(
    "/edit/:id", 
    authenticate(["ADMIN","EMPLOYEE"]),
    editBoardOfDirectorValidation, 
    validateRequest, 
    editBoardOfDirector,
);

router.post(
    "/upload-BOD/:id", 
    upload.single("file"), 
    uploadBoardOfDirectors,
);

module.exports = router;