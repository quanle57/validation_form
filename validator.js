
// Validation Constructor
function validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    };

    var selectorRules = {};

    // Validate function
    function validate(inputElement, rule) {

        // value: inputElement.value
        // test func: rule.test 
        // var errorMessage = rule.test(inputElement.value);
        var errorMessage;
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        
        //  Lấy ra các rules của 1 selector-tag_name
        var rules = selectorRules[rule.selector]
        
        // Lặp qua từng rule & kiếm tra
        // Nếu có lỗi thì dừng kiểm tra
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            
            if (errorMessage) break;
        };

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage
    };

    // Get Form Element need to validate
    var formElement = document.querySelector(options.form);
    
    if (formElement) {

        //  Khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;

            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule)

                if (!isValid) {
                    isFormValid = false;
                } 
            });


            if (isFormValid) {
                var enableInputs = formElement.querySelectorAll('[name]:not(disabled)');
            
                var formValues = Array.from(enableInputs).reduce(function(values, currentInput) {
                    switch (currentInput.type) {
                        case 'radio':
                            if (currentInput.matches(':checked')) {
                                values[currentInput.name] = currentInput.value
                            }
                            break;
                        case 'checkbox':
                            if (currentInput.matches(':checked')) {
                                if (Array.isArray(values[currentInput.name])) {
                                    values[currentInput.name].push(currentInput.value);
                                } else {
                                    values[currentInput.name] = [currentInput.value];
                                };
                            }
                            break;

                        case 'file':
                            values[currentInput.name] = currentInput.files
                            break;
                        default:
                            values[currentInput.name] = currentInput.value

                    }
                    return values
                }, []);
                
                options.onSubmit(formValues);
            } 
        };

        // Xử lý lặp qua mỗi rule (lắng nghe sự kiện blur, input, ...)
        options.rules.forEach(function (rule) {

            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test];
            };

            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function (inputElement) {
                
                // When input loss forcus
                inputElement.onblur = function () {

                    validate(inputElement, rule)
                };

                // When user enter input field
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                };
            });

            
        });
    };
};





// Define rules
// Nguyên tắc của các rules:
//  1. khi có lỗi => trả ra message lỗi
//  2. khi hợp lệ => ko trả ra cái gì
validator.isRequired = function(selector, msg) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined: msg || 'Please enter this field!'
        }
    };
};

validator.isEmail = function(selector, msg) {
    return {
        selector: selector,
        test: function (value) {
            var regrex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regrex.test(value) ? undefined: msg || 'Please enter your email!'
        }
    };
};

validator.minLength = function(selector, min, msg) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined: msg || `Please enter minimum ${min} characters!`
        }
    };
};

validator.isConfirmed = function(selector, getConfirmValue, msg) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : msg || 'Not exact. Please re-enter!'
        }
    }
};