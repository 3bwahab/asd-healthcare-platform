/**
 * API Features class for handling query operations
 * Provides chainable methods for filtering, sorting, field selection,
 * searching, and pagination
 */
class ApiFeatures {
  /**
   * @param {Object} mongooseQuery - Mongoose query object
   * @param {Object} queryString - Express request query string
   */
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  /**
   * Filter results based on query parameters
   * Supports MongoDB operators: gte, gt, lte, lt
   * @returns {ApiFeatures} this - For method chaining
   */
  filter() {
    const queryStringObj = { ...this.queryString };
    const excludesFields = ["page", "sort", "limit", "fields", "keyword"];
    excludesFields.forEach((field) => delete queryStringObj[field]);

    // Replace operators (gte, gt, lte, lt) with MongoDB operators ($gte, $gt, etc.)
    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

    return this;
  }

  /**
   * Sort results by specified fields
   * Defaults to sorting by createdAt descending
   * @returns {ApiFeatures} this - For method chaining
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  /**
   * Limit returned fields
   * Excludes __v field by default
   * @returns {ApiFeatures} this - For method chaining
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  /**
   * Search across multiple fields using regex
   * Searches: address, specialization, qualifications, names, etc.
   * @returns {ApiFeatures} this - For method chaining
   */
  search() {
    if (this.queryString.keyword) {
      const query = {};
      query.$or = [
        { address: { $regex: this.queryString.keyword, $options: "i" } },
        {
          speciailization: { $regex: this.queryString.keyword, $options: "i" },
        },
        { qualifications: { $regex: this.queryString.keyword, $options: "i" } },
        { p_name: { $regex: this.queryString.keyword, $options: "i" } },
        { medican_name: { $regex: this.queryString.keyword, $options: "i" } },
        {
          charity_address: { $regex: this.queryString.keyword, $options: "i" },
        },
      ];

      this.mongooseQuery = this.mongooseQuery.find(query);
    }

    return this;
  }

  /**
   * Paginate results
   * @param {number} countDocuments - Total number of documents
   * @returns {ApiFeatures} this - For method chaining
   */
  paginate(countDocuments) {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 50;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    // Pagination result metadata
    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit);

    // Next page
    if (endIndex < countDocuments) {
      pagination.next = page + 1;
    }

    // Previous page
    if (skip > 0) {
      pagination.prev = page - 1;
    }

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResult = pagination;

    return this;
  }
}

module.exports = ApiFeatures;
