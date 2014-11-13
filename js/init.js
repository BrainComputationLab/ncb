
// initialize model page view
$().ready( function() {
    hidePages();
    $('#model').show();

    $("#addElementModal").on("show.bs.modal", function() {
        $("#elementType").change();
        $("#modalneuronName").val("");
        $("#modalcellGroupName").val("");
        $("#modalcellGroupNum").val("");
    });
});

// initialize main navigation
$().ready( function() {
    $('#mainNav a').click( function() {
        var target;
        $('#mainNav li').removeClass('active');
        $(this).parent().addClass('active');
        hidePages();
        target = $(this).attr('href');
        $(target).show();
        simBuilderUpdateTargets();
    });
});

// function to hide all views
function hidePages() {
    $('#model').hide();
    $('#simulation').hide();
    $('#reports').hide();
    $('#database').hide();
}
