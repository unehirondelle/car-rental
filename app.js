function run(appElement) {
    const $ = (selector, parent = appElement) => parent.querySelector(selector);
    const $$ = (selector, parent = appElement) => parent.querySelectorAll(selector);

    const formElement = $('.form');
    const formWrapperElement = $('.form__wrapper');
    const formContainerElement = $('.form__container');
    const formInnerElement = $('.form__inner');
    const formStepElements = $$('.form__step');
    const formBannerElement = $('.form__banner');
    const formResetElement = $('.form__reset');
    const formSubmitElement = $('.form__submit');
    const formSubmitLockElement = $('.form__submit-lock');
    const submitButton = $('.submitButton');

    let state = {
        ready: false,
        recaptcha: false,
        success: false,
        step: 0
    };

    function render() {
        appElement.classList.toggle('app--ready', state.ready);

        const formWrapperRect = formWrapperElement.getBoundingClientRect();

        formContainerElement.style.width = `${formWrapperRect.width}px`;
        Array.from(formStepElements).forEach((stepElement) => {
            stepElement.classList.remove('form__step--active');
            stepElement.style.width = `${formWrapperRect.width}px`;
        });

        const currentFormStepElement = formStepElements[state.step];
        const currentFormStepRect = currentFormStepElement.getBoundingClientRect();

        currentFormStepElement.classList.add('form__step--active');
        formInnerElement.style.height = `${currentFormStepRect.height}px`;

        formSubmitElement.classList.toggle('form__submit--unlocked', state.recaptcha);
        formSubmitLockElement.classList.toggle('form__submit-lock--unlocked', state.recaptcha);

        /*document.getElementById("formFieldPickUpDate").setAttribute("value", "2020-10-11");
        document.getElementById("formFieldPickUpTime").setAttribute("value", "16:14");
        document.getElementById("formFieldDropOffDate").setAttribute("value", "2020-10-11");
        document.getElementById("formFieldDropOffTime").setAttribute("value", "16:14");*/
        /*document.getElementById("formFieldFirstName").setAttribute("value", "first");
        document.getElementById("formFieldEmail").setAttribute("value", "email@rm");
        document.getElementById("formFieldPhone").value = "1234567890";*/
    }

    function update(change = {}) {
        state = {...state, ...change};
        render();
    }

    function handleChangeStepElementClick(event) {
        const step = parseInt(event.target.dataset.changeStep, 10);
        update({step})
    }

    function handleInputInvalid(event) {
        const firstInvalidElement = $(':invalid', formElement);
        firstInvalidElement.focus();

        const step = Array.from(formStepElements).findIndex((formStepElement) => {
            return formStepElement.contains(firstInvalidElement);
        });

        update({step});
    }

    function handleFormSubmit(event) {
        event.preventDefault();

        console.log("state: ", state);
        if (!state.recaptcha) {
            return;
        }
        const currentFormStepElement = formStepElements[state.step];
        currentFormStepElement.classList.remove('form__step--active');
        formBannerElement.classList.add('form__banner--visible');

        const data = Object.fromEntries(new FormData(formElement));

        console.log('The following data will be sent:');
        console.log(data);

    }

    function handleFormResetClick() {
        formBannerElement.classList.remove('form__banner--visible');

        update({
            recaptcha: false,
            success: true,
            step: 0
        });

    }

    function listen() {
        window.addEventListener('resize', render);

        Array.from($$('[data-change-step]')).forEach((changeStepElement) => {
            changeStepElement.addEventListener('click', handleChangeStepElementClick);
        });

        Array.from($$('input')).forEach((inputElement) => {
            inputElement.addEventListener('invalid', handleInputInvalid);
        });

        submitButton.addEventListener('click', handleFormSubmit);
        formResetElement.addEventListener('click', handleFormResetClick);


        window.__handleRecaptchaCallback = () => {
            update({recaptcha: true});
        };
        window.__handleRecaptchaExpireCallback = () => update({recaptcha: false});

    }

    listen();
    update({ready: true});
}

run(document.querySelector('.app'));