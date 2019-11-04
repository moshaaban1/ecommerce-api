class ApiFeatures {
    constructor(query, model) {
        this.query = query
        this.model = model
    }

    filter() {
        const newQueryObj = { ...this.query }

        // Exclude Page, Sort, Limit, Fields
        const excludeQueries = ['q', 'page', 'sort', 'limit', 'fields']
        excludeQueries.forEach(query => {
            delete newQueryObj[query]
        })

        let queryStr = JSON.stringify(newQueryObj)
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            match => `$${match}`
        )

        this.model = this.model.find(JSON.parse(queryStr))
        if (this.query.q) {
            this.model = this.model.find({
                $or: [
                    { name: { $regex: this.query.q, $options: 'i' } },
                    { category: { $regex: this.query.q, $options: 'i' } },
                    { brand: { $regex: this.query.q, $options: 'i' } }
                ]
            })
        }

        return this
    }

    sort() {
        if (this.query.sort) {
            const sortQuery = this.query.sort.split(',').join(' ')
            this.model = this.model.sort(sortQuery)
        }
        return this
    }

    fields() {
        if (this.query.fields) {
            const fieldsQuery = this.query.fields.split(',').join(' ')
            this.model = this.model.select(fieldsQuery)
        }
        return this
    }

    page() {
        const page = this.query.page * 1 || 1
        const limit = this.query.limit * 1 || 15
        const skip = (page - 1) * limit

        if (this.query.page) {
            this.model = this.model.skip(skip).limit(limit)
        } else {
            this.model = this.model.limit(limit)
        }
        return this.model
    }
}

module.exports = ApiFeatures
