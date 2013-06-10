#!/usr/bin/python -O 
import sys, csv
file="access.log"
inFile = open(file)
outFile = open("out.csv", "wb")

for row in inFile:
#	print row
	row = row.replace(" - - [", ",\"")
	row = row.replace("] \"GET ", "\",\"")
	row = row.replace("HTTP/1.1\"", "\",")
	row = row.replace("- \"-\"", ",") 
	outFile.write(row)
