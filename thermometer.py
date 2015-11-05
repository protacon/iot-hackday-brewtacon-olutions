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
requests.packages.urllib3.disable_warnings()

firebase = firebase.FirebaseApplication('https://iot-homebrew.firebaseio.com', None)

base_dir = '/sys/bus/w1/devices/'
device_folder = glob.glob(base_dir + '28*')[0]
device_file = device_folder + '/w1_slave'

on_pin = 26
off_pin = 24

GPIO.setmode(GPIO.BOARD)
GPIO.setup(on_pin, GPIO.OUT)
GPIO.setup(off_pin, GPIO.OUT)

desired_temp = 0
hysteresis = 0.5
power_is_on = False

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
	GPIO.output(on_pin, True)
	time.sleep(0.5)
	GPIO.output(on_pin, False)
	post_power(power_is_on)

def power_off():
	print('Virta pois')
	global power_is_on
	power_is_on = False
	GPIO.output(off_pin, True)
	time.sleep(0.5)
	GPIO.output(off_pin, False)
	post_power(power_is_on)

def read_temp():
	lines = read_temp_raw()

	while lines[0].strip()[-3:] != 'YES':
		time.sleep(0.2)
		lines = read_temp_raw()

	equals_pos = lines[1].find('t=')

	if equals_pos != -1:
		temp_string = lines[1][equals_pos+2:]
		temp_c = float(temp_string) / 1000.0
		temp_f = temp_c * 9.0 / 5.0 + 32.0
		return temp_c, temp_f

def post_temp(current_temp):
	global content_type
	temp_info = {"timestamp": time.time(), "temp": current_temp}
	firebase.post(url='/Temperatures', data=temp_info, headers=content_type)

def post_power(power):
	global content_type
	json_power = {"timestamp": time.time(), "state": power}
	firebase.post(url='/Power', data=json_power, headers=content_type)

def get_current_program():
	global desired_temp
	current_program = firebase.get('/CurrentProgram', None)
	desired_temp = get_desired_temp(current_program)

def get_desired_temp(current_program):
	if current_program != None and current_program["state"] == True:
		steps = current_program["steps"]
		for step in steps:
			current_time = datetime.now()
			if current_time > datetime.fromtimestamp(step["startDate"] / 1000) and current_time < datetime.fromtimestamp(step["endDate"] / 1000):
				return step["temp"]
	return 0

GPIO.output(on_pin, False)
GPIO.output(off_pin, False)

print('Aloitetaan')
print('Laitefilu: ' + device_file)
loops = 0
while True:
	current_temp = read_temp()[0]
	print("desired temp: " + str(desired_temp) + ", current temp: " + str(current_temp))
	post_temp(current_temp)
	if current_temp > (desired_temp + hysteresis) and power_is_on == True:
		power_off()
	elif current_temp < (desired_temp - hysteresis) and power_is_on == False:
		power_on()
	time.sleep(1)
	loops = loops + 1
	if loops == 1:
		get_current_program()
		loops = 0
