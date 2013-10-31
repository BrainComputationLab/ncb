$().ready( function() {
    $('#model').show();
    $('#simulation').hide();
    $('#reports').hide();
    $('#database').hide();
});

$().ready( function() {
    $('#mainNav a').click( function() {
        var target;
        $('#mainNav li').removeClass('active');
        $(this).parent().addClass('active');
        hidePages();
        target = $(this).attr('href');
        $(target).show();
    });
});

function hidePages() {
    $('#model').hide();
    $('#simulation').hide();
    $('#reports').hide();
    $('#database').hide();
}
