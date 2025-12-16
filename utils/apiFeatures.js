class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter() {
    const queryStringObj = { ...this.queryString };
    const excludesFields = ["page", "sort", "limit", "fields", "keyword"];
    excludesFields.forEach((field) => delete queryStringObj[field]);

    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      let fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  Search() {
    if (this.queryString.keyword) {
      let query = {};
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

  paginate(countDoucuments) {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 50;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    //Pagenation Result
    const pagenation = {};
    pagenation.currentPage = page;
    pagenation.limit = limit;
    pagenation.numOfPage = Math.ceil(countDoucuments / limit);

    //next page
    if (endIndex < countDoucuments) {
      pagenation.next = page + 1;
    }
    //prev page
    if (skip > 0) {
      pagenation.prev = page - 1;
    }

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    this.pagenationResult = pagenation;
    return this;
  }
}

module.exports = ApiFeatures;
