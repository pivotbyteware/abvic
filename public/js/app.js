var datepickers = $('.datepicker').datepicker({
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    format: 'dd-M-yyyy'
});


datepickers.on('changeDate', function(ev){
    $(this).val(ev.target.value);
});
