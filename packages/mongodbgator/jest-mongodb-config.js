console.log('getting configuration');

module.exports = {
  mongodbMemoryServerOptions: {
    instance: {
      dbName: 'test'
    },
    binary: {
      version: '4.0.3',
      skipMD5: true
    },
    autoStart: false
  }
};