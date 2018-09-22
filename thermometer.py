import os 
import glob 
import time 
import RPi.GPIO as GPIO 
import json 
from datetime import datetime 
from firebase import firebase

os.system('modprobe w1-gpio')
os.system('modprobe w1-therm')

import requests.packages.urllib3

firebase = firebase.FirebaseApplication('https://iot-homebrew.firebaseio.com', None)

base_dir = '/sys/bus/w1/devices/'
device_folder = glob.glob(base_dir + '28*')[0]
device_file = device_folder + '/w1_slave'

on_pin = 24
off_pin = 26

GPIO.setmode(GPIO.BOARD)
GPIO.setup(on_pin, GPIO.OUT)
GPIO.setup(off_pin, GPIO.OUT)

desired_temp = 0
hysteresis = 0.5
power_is_on = False
get_current_program_interval = 5
current_program = {}
current_step_id = {}

content_type = {'X_CONTENT_TYPE': 'application/json'}

def read_temp_raw():
	f = open(device_file, 'r')
	lines = f.readlines()
	f.close()
	return lines

def power_on():
	print('Virta paalle')
	global power_is_on
	power_is_on = True
	GPIO.output(on_pin, False)
	post_power(power_is_on)

def power_off():
	print('Virta pois')
	global power_is_on
	power_is_on = False
	GPIO.output(on_pin, True)
	post_power(power_is_on)

def read_temp():
	lines = read_temp_raw()

	while lines[0].strip()[-3:] != 'YES':
		time.sleep(0.2)
		lines = read_temp_raw()

	equals_pos = lines[1].find('t=')

	if equals_pos != -1:
		temp_string = lines[1][equals_pos+2:]
		temp = float(temp_string) / 1000.0
		return temp

def post_temp(current_temp):
	global content_type
	temp_info = {"timestamp": time.time(), "temp": current_temp, "desiredTemp": desired_temp, "step": current_step_id}
	firebase.post(url='/Temperatures', data=temp_info, headers=content_type)

def post_power(power):
	global content_type
	json_power = {"timestamp": time.time(), "state": power}
	firebase.post(url='/Power', data=json_power, headers=content_type)

def get_current_program():
	global desired_temp
	global current_program
	current_program = firebase.get('/CurrentStep', None)

def get_desired_temp():
	if current_program != None:
		return float(current_program["temp"])
	return 0

GPIO.output(on_pin, False)
GPIO.output(off_pin, False)
power_off()
print('Aloitetaan')
print('Laitefilu: ' + device_file)
loops = 0
while True:
	if loops == 0:
		get_current_program()
		loops = get_current_program_interval
	loops = loops - 1

	current_temp = read_temp()
	desired_temp = get_desired_temp()

	print("desired temp: " + str(desired_temp) + ", current temp: " + str(current_temp))

	post_temp(current_temp)

	if current_temp > (desired_temp - hysteresis) and power_is_on == True:
		power_off()
	elif current_temp < (desired_temp - hysteresis) and power_is_on == False:
		power_on()

	time.sleep(1)
