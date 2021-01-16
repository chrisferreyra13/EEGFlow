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