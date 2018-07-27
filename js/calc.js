var START_FREQ = 20;
var STOP_FREQ = 20000;
var RO_AIR = 1.184;
var SOUND_SPEED = 346.1;
var QP = 80;
var SMOOTHING = 1/24;
var driver = {};
var enclosure = {};
var vent = {};
driver.ready = false;
driver.enclosure = enclosure;
driver.enclosure.vent = vent;

var returnFreqArray = function(smoothing){
    var freq = [];
    freq.push(START_FREQ);
    var next_freq = Math.pow(2, smoothing)*START_FREQ;
    while( next_freq <= STOP_FREQ ){
        freq.push(next_freq);
        next_freq = Math.pow(2, smoothing)*next_freq;
    }
    return freq;
};

//Functions for driver T/S params
var calculateCms = function(){
    if(!$("#drv_fs").val()){
        return 0;
    }
    var fs = parseFloat($("#drv_fs").val());
    if(!$("#drv_mms").val()){
        if(!$("#drv_vas").val() || !$("#drv_sd").val()){
            return 0;
        }
        else{
            var vas = parseFloat($("#drv_vas").val());
            vas = vas/1000;
            var sd = parseFloat($("#drv_sd").val());
            var cms = vas/(RO_AIR*Math.pow(SOUND_SPEED,2)*Math.pow(sd,2));
        }
    }
    else{
        var mms = parseFloat($("#drv_mms").val());
        mms = mms/1000;
        var cms = 1/(Math.pow((2*Math.PI*fs),2)*mms);
    }
    $("#drv_cms").val((cms*1000).toFixed(3));
    return cms*1000;
};

var calculateMms = function(){
    if(!$("#drv_fs").val()){
        return 0;
    }
    if(!$("#drv_re").val()){
        return 0;
    }
    if(!$("#drv_bl").val()){
        return 0;
    }
    var fs = parseFloat($("#drv_fs").val());
    var re = parseFloat($("#drv_re").val());
    var bl = parseFloat($("#drv_bl").val());
    if(!$("#drv_qes").val()){
        if(!$("#drv_cms").val()){
            return 0;
        }
        else{
            var cms = parseFloat($("#drv_cms").val());
            cms = cms/1000;
            var mms = 1/(Math.pow((2*Math.PI*fs),2)*cms);
        }
    }
    else{
        var qes = parseFloat($("#drv_qes").val());
        var mms = (qes*Math.pow(bl,2))/(2*Math.PI*fs*re);
    }

    var qes = parseFloat($("#drv_qes").val());
    var mms = (qes*Math.pow(bl,2))/(2*Math.PI*fs*re);
    $("#drv_mms").val((mms*1000).toFixed(3));
    return mms*1000;
};

var calculateRms = function(){
    if(!$("#drv_fs").val()){
        return 0;
    }
    if(!$("#drv_mms").val()){
        return 0;
    }
    if(!$("#drv_qms").val()){
        return 0;
    }
    var fs = parseFloat($("#drv_fs").val());
    var mms = parseFloat($("#drv_mms").val());
    mms = mms/1000;
    var qms = parseFloat($("#drv_qms").val());
    var rms = (2*Math.PI*fs*mms)/qms;
    $("#drv_rms").val(rms.toFixed(3));
    return rms;
};

var calculateQes = function(){
    if(!$("#drv_fs").val()){
        return 0;
    }
    if(!$("#drv_re").val()){
        return 0;
    }
    if(!$("#drv_bl").val()){
        return 0;
    }
    if(!$("#drv_mms").val()){
        return 0;
    }
    var fs = parseFloat($("#drv_fs").val());
    var re = parseFloat($("#drv_re").val());
    var bl = parseFloat($("#drv_bl").val());
    var mms = parseFloat($("#drv_mms").val());
    mms = mms/1000;
    var qes = (2*Math.PI*fs*mms*re)/Math.pow(bl,2);
    $("#drv_qes").val(qes.toFixed(3));
    return qes;
};

var calculateQms = function(){
    if(!$("#drv_fs").val()){
        return 0;
    }
    if(!$("#drv_mms").val()){
        return 0;
    }
    if(!$("#drv_rms").val()){
        return 0;
    }
    var fs = parseFloat($("#drv_fs").val());
    var mms = parseFloat($("#drv_mms").val());
    mms = mms/1000;
    var rms = parseFloat($("#drv_rms").val());
    var qms = (2*Math.PI*fs*mms)/rms;
    $("#drv_qms").val(qms.toFixed(3));
    return qms;
};

var calculateQts = function(){
    if(!$("#drv_qes").val()){
        return 0;
    }
    if(!$("#drv_qms").val()){
        return 0;
    }
    var qes = parseFloat($("#drv_qes").val());
    var qms = parseFloat($("#drv_qms").val());
    var qts = (qes*qms)/(qes+qms);
    $("#drv_qts").val(qts.toFixed(3));
    return qts;
};

var calculateVas = function(){
    if(!$("#drv_sd").val()){
        return 0;
    }
    if(!$("#drv_cms").val()){
        return 0;
    }
    var sd = parseFloat($("#drv_sd").val());
    var cms = parseFloat($("#drv_cms").val());
    cms = cms/1000;
    var vas = RO_AIR*Math.pow(SOUND_SPEED,2)*Math.pow(sd,2)*cms;
    $("#drv_vas").val((vas*1000).toFixed(3));
    return vas*1000;
};

var calculateSd = function(){
    if(!$("#drv_vas").val()){
        return 0;
    }
    if(!$("#drv_cms").val()){
        return 0;
    }
    var vas = parseFloat($("#drv_vas").val());
    vas = vas/1000;
    var cms = parseFloat($("#drv_cms").val());
    cms = cms/1000;
    var sd = Math.sqrt(vas/(RO_AIR*Math.pow(SOUND_SPEED,2)*cms));
    $("#drv_sd").val(sd.toFixed(3));
    return sd;
};

//Functions for driver model
var calculateLces = function(){
    if(!$("#drv_bl").val()){
        return 0;
    }
    var cms = 0;
    if(!$("#drv_cms").val()){
        cms = calculateCms();
        if(cms == 0){
            return 0;
        }
    }
    else{
        cms = parseFloat($("#drv_cms").val());
    }
    var bl = parseFloat($("#drv_bl").val());
    var lces = cms*Math.pow(bl,2);
    //value is in mH
    return lces;
};

var calculateCmes = function(){
    if(!$("#drv_bl").val()){
        return 0;
    }
    var mms = 0;
    if(!$("#drv_mms").val()){
        mms = calculateMms();
        if(mms == 0){
            return 0;
        }
    }
    else{
        mms = parseFloat($("#drv_mms").val());
    }
    var bl = parseFloat($("#drv_bl").val());
    var cmes = mms*1000/Math.pow(bl,2);
    //values is in uF
    return cmes;
};

var calculateRes = function(){
    if(!$("#drv_bl").val()){
        return 0;
    }
    var rms = 0;
    if(!$("#drv_rms").val()){
        rms = calculateRms();
        if(rms == 0){
            return 0;
        }
    }
    else{
        rms = parseFloat($("#drv_rms").val());
    }
    var bl = parseFloat($("#drv_bl").val());
    var res = Math.pow(bl,2)/rms;
    //value is in ohm
    return res;
};

//Functions for Closed enclosure
var calculateLceb = function(){
    if(!$("#drv_bl").val()){
        return 0;
    }
    if(!$("#drv_sd").val()){
        return 0;
    }
    if(!$("#encl_vol").val()){
        return 0;
    }
    var bl = parseFloat($("#drv_bl").val());
    var sd = parseFloat($("#drv_sd").val());
    var vb = parseFloat($("#encl_vol").val());
    var lceb = (Math.pow(bl,2)*vb)/(Math.pow(sd,2)*RO_AIR*Math.pow(SOUND_SPEED,2));
    //value is in mH
    return lceb;
};

var calculateReb = function(){
    if(!$("#drv_fs").val()){
        return 0;
    }
    if(!$("#drv_bl").val()){
        return 0;
    }
    if(!$("#drv_sd").val()){
        return 0;
    }
    if(!$("#encl_vol").val()){
        return 0;
    }
    if(!$("#encl_ql").val()){
        return 0;
    }
    var fs = parseFloat($("#drv_fs").val());
    var bl = parseFloat($("#drv_bl").val());
    var sd = parseFloat($("#drv_sd").val());
    if(!$("#drv_vas").val()){
        var vas = calculateVas();
    }
    else{
      var vas = parseFloat($("#drv_vas").val());
    }
    var vb = parseFloat($("#encl_vol").val());
    var ql = parseFloat($("#encl_ql").val());
    var fb = Math.sqrt(1+(vas/vb))*fs;
    var cb = vb/(1000*RO_AIR*Math.pow(SOUND_SPEED,2));
    var rb = ql/(2*Math.PI*fb*cb);
    var reb = Math.pow(bl,2)/(Math.pow(sd,2)*rb);
    return reb;
};

var calculateCmep = function(){
    if(!$("#drv_bl").val()){
        return 0;
    }
    if(!$("#drv_sd").val()){
        return 0;
    }
    if(!$("#encl_vlen").val()){
        return 0;
    }
    if(!$("#encl_vdia").val()){
        return 0;
    }
    var bl = parseFloat($("#drv_bl").val());
    var sd = parseFloat($("#drv_sd").val());
    var lv = parseFloat($("#encl_vlen").val());
    lv = lv/1000;
    var dv = parseFloat($("#encl_vdia").val());
    dv = dv/1000;
    var sv = Math.PI*Math.pow(dv/2,2);
    var cmep = (RO_AIR*lv*Math.pow(sd,2))/(sv*Math.pow(bl,2));
    return cmep*1000000;
};

var calculateFp = function(){
    if(!driver.enclosure.hasOwnProperty("lceb") || !driver.enclosure.hasOwnProperty("cmep")){
        return 0;
    }
    var L = driver.enclosure.lceb/1000;
    var C = driver.enclosure.cmep/1000000;
    var fp = 1/(2*Math.PI*Math.sqrt(L*C));
    return fp;
};

var calculateRep = function(){
    if(!$("#encl_vlen").val()){
        return 0;
    }
    if(!$("#encl_vdia").val()){
        return 0;
    }
    if(!$("#encl_vol").val()){
        return 0;
    }
    if(!$("#drv_bl").val()){
        return 0;
    }
    if(!$("#drv_sd").val()){
        return 0;
    }
    var bl = parseFloat($("#drv_bl").val());
    var sd = parseFloat($("#drv_sd").val());
    var vb = parseFloat($("#encl_vol").val());
    vb = vb/1000;
    var vd = parseFloat($("#encl_vdia").val());
    vd = vd/1000;
    var sv = Math.PI*Math.pow(vd/2,2);
    var lv = parseFloat($("#encl_vlen").val());
    lv = lv/1000;
    var rv = Math.sqrt(sv/Math.PI);
    var rep = (Math.pow(bl,2)*vb*rv)/(RO_AIR*Math.pow(SOUND_SPEED,2)*Math.pow(sd,2)*sv);
    return rep;
};

var calculateZe = function(f){
  if(!driver.hasOwnProperty("re") || !driver.hasOwnProperty("le")){
      return 0;
  }
  var omega = 2*Math.PI*f;
  var le = driver.le/1000;
  var re = driver.re;
  var ze = Math.sqrt(Math.pow(re,2) + Math.pow(omega*le,2));
  return ze;
};

var calculateZm = function(f){
  if(!driver.hasOwnProperty("res") || !driver.hasOwnProperty("lces") || !driver.hasOwnProperty("cmes")){
      return 0;
  }
  var omega = 2*Math.PI*f;
  var res = driver.res;
  var lces = driver.lces/1000;
  var cmes = driver.cmes/1000000;
  var zm = 1/(Math.sqrt(Math.pow(1/res,2)+Math.pow(1/(omega*lces) - omega*cmes,2)));
  return zm;
};

var calculateZb = function(f){
  if(!driver.enclosure.hasOwnProperty("reb") || !driver.enclosure.hasOwnProperty("lceb")){
      return 0;
  }
  var omega = 2*Math.PI*f;
  //enclosure
  var reb = driver.enclosure.reb;
  var lceb = driver.enclosure.lceb/1000;
  //driver
  var res = driver.res;
  var lces = driver.lces/1000;
  var cmes = driver.cmes/1000000;
  //complex impedance
  var rm = 1/res + reb/(Math.pow(reb,2) + Math.pow(omega*lceb, 2));
  var xm = 1/(omega*lces) + omega*lceb/(Math.pow(reb,2) + Math.pow(omega*lceb,2)) - omega*cmes;
  var r = rm/(Math.pow(rm,2) + Math.pow(xm,2));
  var x = xm/(Math.pow(rm,2) + Math.pow(xm,2));
  var zb = Math.sqrt(Math.pow(r,2) + Math.pow(x,2));
  return zb;
};

var calculateZp = function(f){
  if(!driver.enclosure.hasOwnProperty("rep") || !driver.enclosure.hasOwnProperty("cmep") || !driver.enclosure.hasOwnProperty("lceb")){
      return 0;
  }
  var omega = 2*Math.PI*f;
  //enclosure
  var rep = driver.enclosure.rep;
  var cmep = driver.enclosure.cmep/1000000;
  var lceb = driver.enclosure.lceb/1000;
  //driver
  var res = driver.res;
  var lces = driver.lces/1000;
  var cmes = driver.cmes/1000000;
  //complex impedance
  var rm = 1/res + rep/(Math.pow(rep,2) + Math.pow(omega*lceb - 1/(omega*cmep),2));
  var xm = 1/(omega*lces) + (omega*lceb - 1/(omega*cmep))/(Math.pow(rep,2) + Math.pow(omega*lceb - 1/(omega*cmep),2)) - omega*cmes;
  var r = rm/(Math.pow(rm,2) + Math.pow(xm,2));
  var x = xm/(Math.pow(rm,2) + Math.pow(xm,2));
  var zp = Math.sqrt(Math.pow(r,2) + Math.pow(x,2));
  return zp;
};

var calculateParalelZ = function(arr){
  console.log(arr);
  var sum = 0;
  for(var i=0; i < arr.length; i++){
    sum += 1/arr[i];
  }
  console.log(1/sum);
  return 1/sum;
};


var saveModel = function () {
    if(!driver.ready){
      return;
    }
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(driver));
    var dlAnchorElem = document.getElementById('mdl_dat');
    if(!driver.model){
      driver.model = "generic";
    }
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", driver.model+".json");
};

var saveZma = function (data) {
    if(!driver.ready){
      return;
    }
    var dataStr = "data:text/plain;charset=utf-8," + data;
    var dlAnchorElem = document.getElementById('mdl_zma');
    if(!driver.model){
      driver.model = "generic";
    }
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", driver.model+".zma");
};

$(function() {
    $("#encl_vol").prop("disabled", true);
    $("#encl_ql").prop("disabled", true);
    $("#encl_vdia").prop("disabled", true);
    $("#encl_vlen").prop("disabled", true);
    driver.enclosure.type = "none";
    $("#encl_type").change(function(){
        switch (parseInt($("#encl_type").val())) {
            case 1:
                $("#encl_vol").prop("disabled", true);
                $("#encl_ql").prop("disabled", true);
                $("#encl_vdia").prop("disabled", true);
                $("#encl_vlen").prop("disabled", true);
                $("#mdl_gif").attr("src", "img/model.gif");
                $("#mdl_lceb").text("-");
                $("#mdl_reb").text("-");
                $("#mdl_cmep").text("-");
                $("#mdl_rep").text("-");
                driver.enclosure.type = "none";
                break;
            case 2:
                $("#encl_vol").prop("disabled", false);
                $("#encl_ql").prop("disabled", false);
                $("#encl_vdia").prop("disabled", true);
                $("#encl_vlen").prop("disabled", true);
                $("#mdl_gif").attr("src", "img/closed.gif");
                $("#mdl_cmep").text("-");
                $("#mdl_rep").text("-");
                driver.enclosure.type = "closed";
                break;
            case 3:
                $("#encl_vol").prop("disabled", false);
                $("#encl_ql").prop("disabled", true);
                $("#encl_vdia").prop("disabled", false);
                $("#encl_vlen").prop("disabled", false);
                $("#mdl_gif").attr("src", "img/vented.gif");
                $("#mdl_reb").text("-");
                driver.enclosure.type = "vented";
                break;
        }
    });

    var ctx = document.getElementById('imp_graph').getContext('2d');
    var imp_chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'scatter',

        // The data for our dataset
        data: {
            labels: returnFreqArray(SMOOTHING),
            datasets: [{
                label: "Impedance curve",
                fill:false,
                data: [],
            }]
        },

        // Configuration options go here
        options: {
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    type: 'logarithmic',
                    position: 'bottom',
                    scaleLabel: {
                        display: true,
                        labelString: 'Frequency [Hz]'
                    },
                    ticks: {
                        min: START_FREQ,
                        max: STOP_FREQ
                    }
                }],
                yAxes: [{
                    type: 'linear',
                    position: 'left',
                    scaleLabel: {
                        display: true,
                        labelString: 'Magnitude [Ω]'
                    },
                    ticks: {
                        beginAtZero: true
                    }

                }]
            }
        }
    });

    $("#tab3").click(function(){
        if(!$("#drv_fs").val() || !$("#drv_re").val() || !$("#drv_bl").val()){
            alert("Critical T/S params are missing");
            driver.ready = false;
            return;
        }
        driver.manufacturer = $("#drv_mfg").val();
        driver.model = $("#drv_mdl").val();
        driver.fs = parseFloat($("#drv_fs").val());
        driver.re = parseFloat($("#drv_re").val());
        driver.bl = parseFloat($("#drv_bl").val());
        if($("#drv_le").val()){
            driver.le = parseFloat($("#drv_le").val());
        }
        if(!$("#drv_qes").val()){
            driver.qes = calculateQes();
            if(driver.qes == 0){
                if(!("#drv_cms").val()){
                    driver.cms = calculateCms();
                    if(driver.cms == 0){
                        alert("Critical T/S params are missing");
                        driver.ready = false;
                        return;
                    }
                }
                else{
                    driver.cms = parseFloat($("#drv_cms").val());
                }
                driver.mms = calculateMms();
                driver.qes = calculateQes();
            }
        }
        else{
            driver.qes = parseFloat($("#drv_qes").val());
        }
        if(!$("#drv_qms").val()){
            driver.qms = calculateQms();
            if(driver.qms == 0){
                alert("Critical T/S params are missing");
                driver.ready = false;
                return;
            }
        }
        else{
            driver.qms = parseFloat($("#drv_qms").val());
        }
        if(!$("#drv_qts").val()){
            driver.qts = calculateQts();
        }
        else{
            driver.qts = parseFloat($("#drv_qts").val());
        }
        if(!$("#drv_vas").val()){
            driver.vas = calculateVas();
        }
        else{
            driver.vas = parseFloat($("#drv_vas").val());
        }
        if(!$("#drv_mms").val()){
            driver.mms = calculateMms();
        }
        else{
            driver.mms = parseFloat($("#drv_mms").val());
        }
        if(!$("#drv_cms").val()){
            driver.cms = calculateCms();
        }
        else{
            driver.cms = parseFloat($("#drv_cms").val());
        }
        if(!$("#drv_rms").val()){
            driver.rms = calculateRms();
            if(driver.rms == 0){
                alert("Critical T/S params are missing");
                driver.ready = false;
                return;
            }
        }
        else{
            driver.rms = parseFloat($("#drv_rms").val());
        }
        if(!$("#drv_sd").val()){
            driver.sd = calculateSd();
        }
        else{
            driver.sd = parseFloat($("#drv_sd").val());
        }
        if(driver.mms !=0 && driver.cms !=0 && driver.rms !=0){
            driver.lces = calculateLces();
            driver.cmes = calculateCmes();
            driver.res = calculateRes();
        }
        if(driver.lces !=0 && driver.cmes != 0 && driver.res != 0){
            $("#mdl_re").text(driver.re.toFixed(3));
            $("#mdl_le").text(driver.le.toFixed(3));
            $("#mdl_lces").text(driver.lces.toFixed(3));
            $("#mdl_cmes").text(driver.cmes.toFixed(3));
            $("#mdl_res").text(driver.res.toFixed(3));
        }
        if(driver.enclosure.type == "closed"){
            driver.enclosure.lceb = calculateLceb();
            if(driver.enclosure.lceb == 0){
                alert("Critical params are missing");
                driver.ready = false;
                return;
            }
            driver.enclosure.vb = parseFloat($("#encl_vol").val());
            if(!$("#encl_ql").val()){
                driver.enclosure.ql = 0;
                driver.enclosure.reb = 0;
            }
            else{
                driver.enclosure.ql = parseFloat($("#encl_ql").val());
                driver.enclosure.reb = calculateReb();
            }
            $("#mdl_lceb").text(driver.enclosure.lceb.toFixed(3));
            $("#mdl_reb").text(driver.enclosure.reb.toFixed(3));
        }
        else if(driver.enclosure.type == "vented"){
            driver.enclosure.lceb = calculateLceb();
            if(driver.enclosure.lceb == 0){
                alert("Critical params are missing");
                driver.ready = false;
                return;
            }
            driver.enclosure.vb = parseFloat($("#encl_vol").val());
            if(!$("#encl_ql").val()){
                driver.enclosure.ql = 0;
                driver.enclosure.reb = 0;
            }
            else{
                driver.enclosure.ql = parseFloat($("#encl_ql").val());
                driver.enclosure.reb = calculateReb();
            }
            $("#mdl_lceb").text(driver.enclosure.lceb.toFixed(3));
            $("#mdl_reb").text(driver.enclosure.reb.toFixed(3));
            driver.enclosure.cmep = calculateCmep();
            if(driver.enclosure.cmep == 0){
                alert("Critical params are missing");
                driver.ready = false;
                return;
            }
            driver.enclosure.vent.length = parseFloat($("#encl_vlen").val())/1000;
            driver.enclosure.vent.diameter = parseFloat($("#encl_vdia").val())/1000;
            $("#mdl_cmep").text(driver.enclosure.cmep.toFixed(3));
            driver.enclosure.fb = calculateFp();
            driver.enclosure.rep = calculateRep();
            $("#mdl_rep").text(driver.enclosure.rep.toFixed(3));
        }
        driver.ready = true;
    });

    $("#tab4").click(function(){
      if(!driver.ready){
        alert("Please build a model first");
        return;
      }
      var freq = returnFreqArray(SMOOTHING);
      var z_data = [];
      var zma_file = "";
      if(driver.enclosure.type == "none"){
        for(var i=0; i<freq.length; i++){
            var f = freq[i];
            var ze = calculateZe(f);
            var zm = calculateZm(f);
            var zt = ze + zm;
            z_data.push({x:f,y:zt});
            zma_file +=f+"  "+zt+"\n";
        }
      }
      else if(driver.enclosure.type == "closed"){
        for(var i=0; i<freq.length; i++){
            var f = freq[i];
            var ze = calculateZe(f);
            var za = calculateZb(f);
            var zt = ze + za;
            z_data.push({x:f,y:zt});
            zma_file +=f+"  "+zt+"\n";
        }
      }
      else if(driver.enclosure.type == "vented"){
        for(var i=0; i<freq.length; i++){
            var f = freq[i];
            var ze = calculateZe(f);
            var za = calculateZp(f);
            var zt = ze + za;
            z_data.push({x:f,y:zt});
            zma_file +=f+"  "+zt+"\n";
        }
      }
      //driver.impedance = z_data;
      imp_chart.data.datasets[0].data = z_data;
      imp_chart.update();
    });
});
