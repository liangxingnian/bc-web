$(document).ready(function () {
    if ($(this).scrollTop() > 0) {
        $('.nav-wrapper').css('background-color', '#0f132e')
    }
    $(window).on('scroll', function () {
        const scrollTop = $(this).scrollTop();
        if (scrollTop > 0) {
            $('.nav-wrapper').css('background-color', '#0f132e')
        } else {
            $('.nav-wrapper').css('background-color', '')
        }
    });
});

function changeLang() {
    const type = $('.i18n-lang').text()
    if (type === 'EN') {
        const en = lang.en
        for (const key in en) {
            $('.i18n-' + key).text(en[key])
        }
    } else {
        location.reload()
    }
}
