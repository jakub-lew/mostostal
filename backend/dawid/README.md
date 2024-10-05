# INSTALATION

python -m pip install pipenv
pipenv install


# RUN 

pipenv run fastapi dev server.py --port 8888

# SERVERLESS RUN 

pipenv run python server.py ./file/path


# USAGE

GET http://localhost:8888/get_bbox/
    body -> {path:str} # ścieżka do modelu.... :P
    returns json 

> nie mam pojęcia jak to zapisać :D

# TESTY

curl -X POST "http://localhost:8888/get_bbox/" -d '{"path":"http://localhost:5200/example.ifc"}'
