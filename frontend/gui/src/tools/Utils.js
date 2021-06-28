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
        const idxs=plotChannels.map((ch) => dataChannels.findIndex((chName) => ch===chName))
        for(var j = 0; j < plotChannels.length; j += 1){
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