const serverConf= {
    url: 'http://127.0.0.1:8000/fm',
    process: {
        url: '/process/',
        method: 'POST',
        withCredentials: false,
        onload: (response) => response.key,
        onerror: (response) => response.data,
    },
    load: {
      url: '/load/',
      method: 'GET'
    }
  }

export default serverConf