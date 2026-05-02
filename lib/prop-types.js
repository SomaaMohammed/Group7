function validator() {
    return null;
}

validator.isRequired = validator;

function chainableValidator() {
    return validator;
}

const PropTypes = {
    any: validator,
    array: validator,
    bool: validator,
    element: validator,
    func: validator,
    node: validator,
    number: validator,
    object: validator,
    string: validator,
    arrayOf: chainableValidator,
    exact: chainableValidator,
    instanceOf: chainableValidator,
    oneOfType: chainableValidator,
    shape: chainableValidator,
};

export default PropTypes;
