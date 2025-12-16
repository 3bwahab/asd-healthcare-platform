const express = require("express");
const {
  getQustion,
  checkRelevance,
  processAnswer,
  finalPrediction,
  getQustionDegree,
  checkRelevanceDegree,
  processAnswerDegree,
  getAudio,
  uploadAudio,
  finalPredictionDegree,
  saveChatWithAI,
  getChatHistory,
  getAustesmHistory,
  getDegreeHistory,
} = require("../../services/AiSerives/aiServices");

const AuthServices = require("../../services/authServices");

const router = express.Router();

router.use(
  AuthServices.protectForParent,
  AuthServices.allowedToParent("parent")
);

// router.route("/check_relevance").post(checkRelevance);
// router.route("/process_answer").post(processAnswer);
// router.route("/final_prediction").post(finalPrediction);
//*----------------------------------------------------------
// router.route("/check_relevance_degree").post(checkRelevanceDegree);
// router.route("/process_answer_degree").post(uploadAudio, processAnswerDegree);
//*----------------------------------------------------------

//* autism predication

router.route("/get_question/:index").get(getQustion);

router
  .route("/finalPredication")
  .post(uploadAudio, checkRelevance, processAnswer, finalPrediction);

//*----------------------------------------------------------
//* autism degree predication

router.route("/get_question_degree/:index").get(getQustionDegree);

router
  .route("/finalPredication_degree")
  .post(
    uploadAudio,
    checkRelevanceDegree,
    processAnswerDegree,
    finalPredictionDegree
  );

//*----------------------------------------------------------
router.route("/autism_history").get(getAustesmHistory);
router.route("/degree_history").get(getDegreeHistory);
//*----------------------------------------------------------

router.route("/transcribe_audio").post(uploadAudio, getAudio);

//*------------------------------------------------------------

//* ChatBot

router.route("/chat").post(saveChatWithAI);
router.route("/chat/:session_id").get(getChatHistory);

module.exports = router;
