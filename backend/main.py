from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers import fire, flood, heat, humidex, led, wind
from sensors.led import status_led

app = FastAPI(title="Hazard Monitor API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    init_db()


@app.on_event("shutdown")
async def shutdown():
    status_led.close()


app.include_router(wind.router,    prefix="/api/wind",    tags=["wind"])
app.include_router(heat.router,    prefix="/api/heat",    tags=["heat"])
app.include_router(fire.router,    prefix="/api/fire",    tags=["fire"])
app.include_router(flood.router,   prefix="/api/flood",   tags=["flood"])
app.include_router(humidex.router, prefix="/api/humidex", tags=["humidex"])
app.include_router(led.router,     prefix="/api/led",     tags=["led"])


@app.get("/api/health")
async def health():
    return {"status": "ok"}
