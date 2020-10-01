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

        formInnerElement.style.transform = `translate(${formWrapperRect.width * state.step}px, 0)`;

        const currentFormStepElement = formStepElements[state.step];
        const currentFormStepRect = currentFormStepElement.getBoundingClientRect();

        currentFormStepElement.classList.add('form__step--active');
        formInnerElement.style.height = `${currentFormStepRect.height}px`;

        formSubmitElement.classList.toggle('form__submit--unlocked', state.recaptcha);
        formSubmitLockElement.classList.toggle('form__submit-lock--unlocked', state.recaptcha);
    }

    function update(change = {}) {
        state = {...state, ...change};
        render();
    }

    function handleChangeStepElementClick(event) {
        const step = parseInt(event.target.dataset.changeStep, 10);
        update({ step });
    }

    function handleInputInvalid(event) {
        const firstInvalidElement = $(':invalid', formElement);
        firstInvalidElement.focus();

        const step = Array.from(formStepElements).findIndex((formStepElement) => {
            return formStepElement.contains(firstInvalidElement);
        });

        update({ step });
    }

    async function handleFormSubmit(event) {
        if (!state.recaptcha) {
            return;
        }

        const data = Object.fromEntries(new FormData(formElement));

        console.log('The following data will be sent:');
        console.log(data);
    }

    function handleFormResetClick() {
        update({
            success: false,
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

        formElement.addEventListener('submit', handleFormSubmit);
        formResetElement.addEventListener('click', handleFormResetClick);


        window.__handleRecaptchaCallback = () => update({ recaptcha: true });
        window.__handleRecaptchaExpireCallback = () => update({ recaptcha: true });
    }

    listen();
    update({ ready: true });
}

run(document.querySelector('.app'));