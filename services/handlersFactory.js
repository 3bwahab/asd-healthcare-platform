const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(
        new ApiError(`There is no document for this id: ${req.params.id}`)
      );
    }
    res.status(200).json({ status: "Deleted..." });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`There is no document for this id: ${req.params.id}`)
      );
    }
    document.save();
    res.status(200).json({ status: "Success", data: document });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({ status: "Success", data: document });
  });

exports.getOne = (Model, populationOpts) =>
  asyncHandler(async (req, res, next) => {
    //* Build query
    let query = Model.findById(req.params.id);
    if (populationOpts) {
      query.populate(populationOpts);
    }
    //* Execute query
    const document = await query;
    if (!document) {
      return next(new ApiError(`No document for this id: ${req.params.id}`));
    }

    res.status(200).json({ status: "Success", data: document });
  });

exports.getAll = (Model) =>
  asyncHandler(async (req, res, next) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    //* Bulid Query
    const documentCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .paginate(documentCounts)
      .filter()
      .sort()
      .limitFields()
      .Search();

    //* Execute query
    const { mongooseQuery, pagenationResult } = apiFeatures;
    const document = await mongooseQuery;

    res
      .status(200)
      .json({ results: document.length, pagenationResult, data: document });
  });
