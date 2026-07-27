"""Wrapper around the Freenove DHT11 shared library (see ressources/Freenove_DHT.py).

Only loads on the Raspberry Pi, where /usr/lib/libdht.so is installed by the
Freenove SDK. On any other platform (e.g. a dev machine on Windows), loading
the library fails and `available` stays False so callers can fall back to
mock data instead of crashing.
"""
import ctypes
import time
from typing import Optional, Tuple

LIB_PATH = "/usr/lib/libdht.so"
DEFAULT_PIN = 17

# Données du capteur

class DHT11Sensor:
    def __init__(self, pin: int = DEFAULT_PIN):
        self._lib = None
        try:
            lib = ctypes.CDLL(LIB_PATH)
            lib.setDHT11Pin.argtypes = [ctypes.c_int]
            lib.readSensor.argtypes = [ctypes.c_int, ctypes.c_int]
            lib.readSensor.restype = ctypes.c_int
            lib.readDHT11.restype = ctypes.c_int
            lib.getHumidity.restype = ctypes.c_double
            lib.getTemperature.restype = ctypes.c_double
            lib.setDHT11Pin(pin)
            self._lib = lib
        except OSError:
            self._lib = None

    @property
    def available(self) -> bool:
        return self._lib is not None

    def read(self, retries: int = 15, delay: float = 0.1) -> Optional[Tuple[float, float]]:
        """Return (temperature_c, humidity_pct), or None if the sensor is
        unavailable or the read never succeeded within `retries` attempts."""
        if not self._lib:
            return None
        for _ in range(retries):
            if self._lib.readDHT11() == 0:
                return self._lib.getTemperature(), self._lib.getHumidity()
            time.sleep(delay)
        return None


dht11 = DHT11Sensor()
