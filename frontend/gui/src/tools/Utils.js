export function SamplesToTimes(samples,samplingFreq,decimals){
    if(Array.isArray(samples)){
        var factor=Math.pow(10,decimals)
        var times=samples.map(sample => (Math.round((sample*(1/samplingFreq)+Number.EPSILON)*factor)/factor))
        
    }
    else{
        var factor=Math.pow(10,decimals)
        var times=Math.round((samples*(1/samplingFreq)+Number.EPSILON)*factor)/factor
        
    }
    return times
}

export function PrepareDataForPlot(dataX,dataY,sFreq, dataChannels,plotChannels, minIndex, maxIndex, gain){
    
    let data=[];   
    let dataPoints = [];
    
    if(plotChannels.length!=0){ //Por seguridad, ver else
        // Si no coinciden hay error, tenerlo en cuenta para hacer una excepcion
        let x=0
        const idxs=[];
        let idx=-1;
        plotChannels.forEach((ch) => {
            idx=dataChannels.findIndex((chName) => ch===chName)
            if(idx!=-1)
                idxs.push(idx)
        })
        for(var j = 0; j < idxs.length; j += 1){
            for (var i = minIndex; i < maxIndex; i += 1) {

                if(dataX.length==0){
                    x=SamplesToTimes(i,sFreq,3)
                }else{x=dataX[i]}
                dataPoints.push({
                x: x,
                y: gain*dataY[idxs[j]][i]
            });
            }
            data.push(dataPoints)
            dataPoints=[]
        }
    }/*else{
        for (var i = minIndex; i < maxIndex; i += 1) {
            dataPoints.push({
            x: SamplesToTimes(i,sFreq,3),
            y: Math.pow(10,6)*dataY[1][i]
            });
        }
        data=dataPoints
    }*/
    return data
}

export function eventsToOptions(events){
    let eventSplitted=null
    return events.map((event) =>{
      eventSplitted=event.split(',')
      return{
        value:('ID:'+eventSplitted[0]+' || LAT:'+eventSplitted[1]), 
        label:('ID:'+eventSplitted[0]+' || LAT:'+eventSplitted[1]),
      }
    })

}

export function optionsToEvents(options){
    let valueSplitted=null;
    let Len=null;
    let id=null;
    let time=null;
    return options.map((option) => {
      valueSplitted=option.value.split(":")
      Len=valueSplitted[1].indexOf(" || LAT")
      id=valueSplitted[1].substr(0,Len)
      time=valueSplitted[2];
      return{
        value:(id+','+time),
        label:option.label,
      }
    }) 
}
export function epochsToOptions(epochs,event_ids,event_samples,sfreq){
    let valueFormat=null;
    let epochIdx=0;
    
    if (Array.isArray(epochs)){ 
        return epochs.map(epo =>{
            epochIdx=parseInt(epo)-1
            valueFormat='EPO:'+epo+
                ' || ID:'+event_ids[epochIdx].toString()+
                ' || LAT:'+SamplesToTimes(event_samples[epochIdx],sfreq,3).toString()
            return{
                value:valueFormat, 
                label:valueFormat,
            }
        })
    }else{
        epochIdx=parseInt(epochs)-1 //is just one epoch
        valueFormat='EPO:'+epochs+
            ' || ID:'+event_ids[epochIdx].toString()+
            ' || LAT:'+SamplesToTimes(event_samples[epochIdx],sfreq,3).toString()
        return{
            value:valueFormat, 
            label:valueFormat,
        }
    }
}

export function optionsToEpochs(options){
    let valueSplitted=null;
    let Len=null;
    let epo=null;
    console.log(options)
    if (Array.isArray(options)){
        return options.map((option) => {
            valueSplitted=option.value.split(":")
            Len=valueSplitted[1].indexOf(" || ID")
            epo=valueSplitted[1].substr(0,Len)
            return{
              value:epo,
              label:option.label,
            }
        })
    }else{
        valueSplitted=options.value.split(":")
        Len=valueSplitted[1].indexOf(" || ID")
        epo=valueSplitted[1].substr(0,Len)
        return {
            value:epo,
            label:options.label,
        } 
    }
}