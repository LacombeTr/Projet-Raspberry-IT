from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    NASA_FIRMS_API_KEY: str
    OPENWEATHERMAP_API_KEY: str
    FIRE_RADIUS_KM: int
    FIRMS_URL: str
    FIRMS_SOURCE: str
    LATITUDE: float
    LONGITUDE: float
    VIGICRUES_STATION_CODE: str
    METEOFRANCE_API_KEY: str
    METEOFRANCE_DEPT: str

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="allow"
    )

settings = Settings()