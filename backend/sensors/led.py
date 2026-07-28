# Ne s'initialise que sur le Raspberry Pi, où la LED RGB est câblée sur les
# GPIO 17 (rouge), 18 (vert) et 27 (bleu). Sur toute autre plateforme (ex. un
# poste de dev Windows), la création du RGBLED gpiozero échoue et `available`
# reste False afin que les appelants ne fassent rien plutôt que de planter.
# """
from gpiozero import RGBLED

from config import settings

# Couleur (r, g, b) dans [0, 1] associée à chaque sévérité
SEVERITY_COLOR = {
    "ok": (0, 1, 0),
    "warning": (1, 0.5, 0),
    "danger": (1, 0, 0),
}


class StatusLED:
    def __init__(self, red: int, green: int, blue: int):
        self._led = None
        try:
            self._led = RGBLED(red=red, green=green, blue=blue, active_high=True)
        except Exception:
            self._led = None

    @property
    def available(self) -> bool:
        return self._led is not None

    def set_color(self, severity: str) -> None:
        if not self._led:
            return
        self._led.color = SEVERITY_COLOR[severity]

    def close(self) -> None:
        if self._led:
            self._led.close()


status_led = StatusLED(settings.LED_RED_PIN, settings.LED_GREEN_PIN, settings.LED_BLUE_PIN)