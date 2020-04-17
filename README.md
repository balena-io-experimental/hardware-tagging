# hardware-tagging

This project tags a device with it's relevant hardware data in balenaCloud.

Simply add the source to your `docker-compose.yml` to take advantage of this tagging. This service does not yet support
updates at runtime unless you restart it continuously as there's no timer built in yet.

There are some required `docker-compose.yml` settings:

```
labels:
      io.balena.features.sysfs: '1'
      io.balena.features.balena-api: '1'
```

Example:
![tags](./tags.png?raw=true)
