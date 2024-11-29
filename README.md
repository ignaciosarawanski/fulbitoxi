# Fulbito

Fulbito is a videogame that its about filling a football XI with players from the clubs they are given.

## Installation

Required: [Python3+](https://www.python.org/downloads/).
Use the package manager [pip](https://pip.pypa.io/en/stable/) to install Django and python-decouple.

### Windows

```bash 
fulbito-app> py -m venv .venv
fulbito-app> .venv\Scripts\activate.bat
(venv) fulbito-app> python -m pip install Django==5.0.6
(venv) fulbito-app> python -m pip install python-decouple
```

### macOs and Linux

```bash 
fulbito-app> python -m venv .venv
fulbito-app> .venv/bin/activate
(venv) fulbito-app> python -m pip install Django==5.0.6
(venv) fulbito-app> python -m pip install python-decouple
```

## Usage

```bash
(venv) fulbito-app/fulbito> python manage.py runserver
```
## Important Info

Create the .env file using as a template the .env.example and change the enviroment variables for your passkeys.

## License

[MIT](https://choosealicense.com/licenses/mit/)