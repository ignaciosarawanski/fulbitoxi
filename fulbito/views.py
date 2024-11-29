from django.http import JsonResponse
from django.shortcuts import render 
from .models import League, Player, Team

def home(request):
    return render(request, 'fulbito/home.html', {})

def random(request):
    return render(request, 'fulbito/random_team.html', {
        'league': League.objects.all(),
        'players': Player.objects.all(),
        'team': Team.objects.all()
        })

def get_player_data(request):
    if request.method == "GET":
        players = Player.objects.values('player_id', 'first_name', 'nickname', 'surname', 'display_name', 'main_position', 'alt_position1', 'alt_position2', 'team')
        return JsonResponse(list(players), safe=False)
    
def get_teams_data(request):
    if request.method == "GET":
        teams = Team.objects.values('team_id', 'team_name', 'league')
        return JsonResponse(list(teams), safe=False)