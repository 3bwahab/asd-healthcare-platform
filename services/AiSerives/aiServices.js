const asyncHandler = require("express-async-handler");
const axios = require("axios");

const multer = require("multer");
const FormData = require("form-data");
const { v4: uuidv4 } = require("uuid");

const ApiError = require("../../utils/apiError");
const Question = require("../../models/Ai/questionModel1");
const QuestionDegree = require("../../models/Ai/questionDegreeModel1");
const Answer = require("../../models/Ai/answerModel");
const AnswerDegree = require("../../models/Ai/answerDegreeModel");
const Prediction = require("../../models/Ai/predictionModel");
const chatSession = require("../../models/Ai/chatSessionModel");
const Child = require("../../models/childModel");
const Parent = require("../../models/parentModel");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("audio")) {
    cb(null, true);
  } else {
    cb(new ApiError("Only Audio Files Are Allowed", 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadAudio = upload.single("audio");
//*------------------------------------------------------------------------

const FASTAPI_URL = process.env.FASTAPI_URL;

const getQuestionFromAPI = async (index, type) => {
  const url =
    type === "screening"
      ? `${process.env.FASTAPI_URL}/get_question/${index}`
      : `${process.env.FASTAPI_URL}/get_degree_question/${index}`;

  const { data } = await axios.get(url);
  return {
    question: data.question_text,
    index: data.index,
  };
};

//---------------------------------------------
//* Get Qustion
exports.getQustion = asyncHandler(async (req, res, next) => {
  const index = parseInt(req.params.index);
  let q = await Question.findOne({ type: "screening", index });

  if (!q || !q.text) {
    const { question } = await getQuestionFromAPI(index, "screening");
    q = new Question({ type: "screening", index, text: question });
    await q.save();
  }

  res.json({
    done: false,
    question_index: q.index,
    question_text: q.text,
  });
});

//---------------------------------------------
// [1] Check Relevance of Answer (text or audio)
exports.checkRelevance = asyncHandler(async (req, res, next) => {
  let { index, answer } = req.body;

  if (!answer && req.file) {
    const form = new FormData();
    form.append("audio", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const { data } = await axios.post(`${FASTAPI_URL}/transcribe_audio`, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    if (!data) {
      return next(new ApiError("Failed to transcribe audio", 500));
    }

    answer = data.transcribed_text;
  }

  if (!answer) {
    return next(new ApiError("Answer text or audio must be provided", 400));
  }

  const question = await Question.findOne({ type: "screening", index });

  if (!question) {
    return next(new ApiError("Question not found", 404));
  }

  // const existingAnswer = await Answer.findOne({
  //   parentId: req.parent._id,
  //   questionIndex: index,
  // });

  // if (existingAnswer) {
  //   return next(
  //     new ApiError(
  //       "An answer has already been submitted for this question.",
  //       400
  //     )
  //   );
  // }

  const resp = await axios.post(`${FASTAPI_URL}/check_relevance`, {
    question: question.text,
    answer,
  });

  if (!resp.data.relevance) {
    return next(
      new ApiError("The answer is not relevant to the question.", 422)
    );
  }

  req.checkData = resp.data;
  req.body.answer = answer;

  next();
});

// [2] Process Answer and Save to DB
exports.processAnswer = asyncHandler(async (req, res, next) => {
  const { index, answer } = req.body;

  const processData = await axios.post(`${FASTAPI_URL}/process_answer`, {
    index,
    answer,
  });

  const mappedResponse = processData.data.processed_value;

  // const answerDoc = new Answer({
  //   parentId: req.parent._id,
  //   questionIndex: index,
  //   answerText: answer,
  //   relevance: req.checkData.relevance,
  //   mappedResponse,
  //   type: "screening",
  // });

  // await answerDoc.save();

  await Answer.findOneAndUpdate(
    {
      parentId: req.parent._id,
      questionIndex: index,
    },
    {
      answerText: answer,
      relevance: req.checkData?.relevance,
      mappedResponse,
      type: "screening",
    },
    {
      new: true,
      upsert: true,
    }
  );

  const totalQuestions = await Question.countDocuments({ type: "screening" });
  const answeredQuestions = await Answer.countDocuments({
    parentId: req.parent._id,
    type: "screening",
  });

  if (totalQuestions !== answeredQuestions) {
    return res.json({
      message: "Waiting for all answers before final prediction.",
    });
  }

  const allAnswers = await Answer.find({
    parentId: req.parent._id,
    type: "screening",
  }).select("mappedResponse");

  const answersData = allAnswers.map((a) => Number(a.mappedResponse));

  req.answersData = answersData;
  next();
});

// [3] Make Final Prediction
exports.finalPrediction = asyncHandler(async (req, res, next) => {
  const existingPrediction = await Prediction.findOne({
    parentId: req.parent._id,
    type: "autism",
  });

  if (existingPrediction) {
    return res.status(400).json({
      message: "You have already submitted a degree prediction.",
    });
  }
  const prediction = await axios.post(`${FASTAPI_URL}/final_prediction`, {
    answers: req.answersData,
  });

  const child = await Child.findOne({ parent: req.parent._id });

  child.autism_level = prediction.data.autism_prediction;
  await child.save();

  const predDoc = new Prediction({
    parentId: req.parent._id,
    type: "autism",
    inputs: req.answersData,
    output: prediction.data,
  });

  await predDoc.save();
  const data = prediction.data;

  res.json({
    message: "Final prediction autism done.",
    data,
  });
});

//*--------------------------------------------------------------------

//* Get Qustion
exports.getQustionDegree = asyncHandler(async (req, res, next) => {
  const index = parseInt(req.params.index);
  let q = await QuestionDegree.findOne({ type: "degree", index });

  if (!q || !q.text) {
    const { question } = await getQuestionFromAPI(index, "degree");
    q = new QuestionDegree({ type: "degree", index, text: question });
    await q.save();
  }

  res.json({
    done: false,
    question_index: q.index,
    question_text: q.text,
  });
});

//*--------------------------------------------------------------------

// * Check Relevance for Degree Questions
exports.checkRelevanceDegree = asyncHandler(async (req, res, next) => {
  let { index, answer } = req.body;

  // If no answer text and audio file exists, transcribe audio
  if (!answer && req.file) {
    const form = new FormData();
    form.append("audio", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const { data } = await axios.post(`${FASTAPI_URL}/transcribe_audio`, form, {
      headers: form.getHeaders(),
    });

    if (!data) {
      return next(new ApiError("Failed to transcribe audio", 500));
    }

    answer = data.transcribed_text;
  }

  if (!answer) {
    return next(new ApiError("Answer text or audio must be provided", 400));
  }

  // Find the question from the database
  const question = await QuestionDegree.findOne({ type: "degree", index });

  if (!question) {
    return next(new ApiError("Question not found", 404));
  }

  // Send question and answer to FastAPI to check relevance
  const resp = await axios.post(`${FASTAPI_URL}/check_relevance_degree`, {
    question: question.text,
    answer,
  });

  if (!resp.data.relevance) {
    return next(new ApiError("The answer is not relevant", 404));
  }

  // Attach data for next middleware
  req.checkData = resp.data;
  req.body.answer = answer;

  next();
});

// * Process Answer for Degree Questions
exports.processAnswerDegree = asyncHandler(async (req, res, next) => {
  const { index, answer } = req.body;

  const { data } = await axios.post(`${FASTAPI_URL}/process_degree_answer`, {
    question_index: index,
    answer,
  });

  const mappedResponse = data.mapped_value;

  await AnswerDegree.findOneAndUpdate(
    {
      parentId: req.parent._id,
      questionIndex: index,
    },
    {
      answerText: answer,
      relevance: req.checkData?.relevance,
      mappedResponse,
      type: "degree",
    },
    {
      new: true,
      upsert: true, // <-- This inserts a new doc if none matches
    }
  );

  const totalQuestions = await QuestionDegree.countDocuments({
    type: "degree",
  });

  const answeredQuestions = await AnswerDegree.countDocuments({
    parentId: req.parent._id,
  });

  // Collect answers only if all are answered
  if (totalQuestions === answeredQuestions) {
    const allAnswers = await AnswerDegree.find({
      parentId: req.parent._id,
    }).select("mappedResponse");

    req.answersData = allAnswers.map((a) => a.mappedResponse);
  } else {
    req.answersData = null;
  }

  next();
});

// * Final Prediction for Degree Level
exports.finalPredictionDegree = asyncHandler(async (req, res, next) => {
  if (!req.answersData) {
    return res.json({
      message:
        "Waiting for all answers to be provided before final prediction.",
    });
  }

  const existingPrediction = await Prediction.findOne({
    parentId: req.parent._id,
    type: "degree",
  });

  if (existingPrediction) {
    return res.status(400).json({
      message: "You have already submitted a degree prediction.",
    });
  }

  const { data } = await axios.post(`${FASTAPI_URL}/final_degree_prediction`, {
    mapped_responses: req.answersData,
  });

  const child = await Child.findOne({ parent: req.parent._id });
  child.degree_level = data.degree_prediction;
  await child.save();

  const prediction = new Prediction({
    parentId: req.parent._id,
    type: "degree",
    inputs: req.answersData,
    output: data,
  });

  await prediction.save();

  res.json({
    message: "Final prediction degree done.",
    data,
  });
});

//*--------------------------------------------------------------------
//* get History of specific parent for autism and degree predication

exports.getAustesmHistory = asyncHandler(async (req, res, next) => {
  const parentId = req.parent._id;
  const prediction = await Prediction.find({
    parentId,
    type: "autism",
  });
  if (!prediction) {
    return next(
      new ApiError(`There is no predication for this Parent ${req.parent._id}`)
    );
  }

  res.status(200).json({ status: "Sucess", data: prediction });
});

exports.getDegreeHistory = asyncHandler(async (req, res, next) => {
  const parentId = req.parent._id;
  const prediction = await Prediction.find({
    parentId,
    type: "degree",
  });
  if (!prediction) {
    return next(
      new ApiError(`There is no predication for this Parent ${req.parent._id}`)
    );
  }

  res.status(200).json({ status: "Sucess", data: prediction });
});

//*--------------------------------------------------------------------

exports.getAudio = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError("No audio file uploaded", 400));
  }

  const form = new FormData();
  form.append("audio", req.file.buffer, {
    filename: req.file.originalname,
    contentType: req.file.mimetype,
  });

  const { data } = await axios.post(`${FASTAPI_URL}/transcribe_audio`, form, {
    headers: {
      ...form.getHeaders(),
    },
  });
  if (!data) {
    return next(
      new ApiError(`Error transcribing audio: ${error.message}`, 500)
    );
  }
  // console.log(data.transcribed_text);

  res.json({ data });
});

//*-------------------------------------------------------
//* chatbot session
// POST /chat
exports.saveChatWithAI = asyncHandler(async (req, res, next) => {
  let session_id = "";

  if (!req.parent.session_id) {
    session_id = uuidv4();
    req.parent.session_id = session_id;
    await req.parent.save();
  } else {
    session_id = req.parent.session_id;
  }

  console.log(req.parent.session_id);

  const { messages } = req.body;

  if (!messages || !messages.length) {
    return next(new ApiError("No messages provided.", 400));
  }

  messages[0].role = "user";

  const aiResponse = await axios.post(`${FASTAPI_URL}/chat`, {
    session_id,
    messages,
  });

  if (!aiResponse || !aiResponse.data) {
    return next(
      new ApiError("Error communicating with AI server or saving chat:", 500)
    );
  }

  const assistantMessage = {
    role: "assistant",
    content: aiResponse.data.response,
  };

  let session = await chatSession.findOne({ session_id });

  if (!session) {
    session = new chatSession({
      session_id,
      chat_history: [...messages, assistantMessage],
    });
  } else {
    session.chat_history.push(...messages, assistantMessage);
  }

  await session.save();

  res.status(200).json({
    session_id,
    response: assistantMessage.content,
  });
});

//*---Chat History--------------

exports.getChatHistory = async (req, res) => {
  const { session_id } = req.params;

  const aiResponse = await axios.get(
    `${FASTAPI_URL}/chat_history/${session_id}`
  );
  if (!aiResponse) {
    return next(
      new ApiError("Failed to fetch chat history from AI server", 500)
    );
  }

  res.status(200).json(aiResponse.data);
};
