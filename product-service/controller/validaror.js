
exports.validatedata = (data) => {
    const errors = [];

    if (!data.productname || typeof data.productname !== 'string') {
        errors.push('Valid product name is required.');
    }

    if (!data.description || typeof data.description !== 'string') {
        errors.push('Valid description is required.');
    }

    if (isNaN(data.price) || data.price < 0) {
        errors.push('Price must be a positive number.');
    }

    if (isNaN(data.unitsavailable) || data.unitsavailable < 0) {
        errors.push('Number of units available must be a positive number.');
    }

    if (!data.category || typeof data.category !== 'string') {
        errors.push('Category is required.');
    }
    if (!data.subcategory || typeof data.subcategory !== 'string') {
        errors.push('subCategory is required.');
    }
    if (!data.company || typeof data.company !== 'string') {
        errors.push('company is required.');
    }

    if (data.reviews) {
        if (!Array.isArray(data.reviews)) {
            errors.push('Reviews must be an array.');
        } else {
            data.reviews.forEach((review, index) => {
                if (!review.username || typeof review.username !== 'string') {
                    errors.push(`Review at index ${index} must have a valid username.`);
                }
                if (!review.userid || typeof review.userid !== 'string') {
                    errors.push(`Review at index ${index} must have a valid userid.`);
                }
                if (!review.message || typeof review.message !== 'string') {
                    errors.push(`Review at index ${index} must have a valid message.`);
                }
           
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
