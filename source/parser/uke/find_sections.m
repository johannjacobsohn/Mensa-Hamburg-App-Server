#!/usr/bin/octave -qf
%
% This script uses PEAKDET by Eli Billauer which is released to the public
% domain.
% 
%~ fileparts(mfilename('fullpath'));

addpath( fileparts(mfilename('fullpath')) );

arg_list = argv();
a = arg_list{1};

Ia = imread(a);
green = Ia(:,:,2);

meanVert = mean(green, 2);
[maxVert, minVert] = peakdet(meanVert, 0.5);
minVert = sortrows(minVert, 2);
minVert = minVert(1:17,:);
minVert = sortrows(minVert, 1);
minVert = minVert(:,1);
minVert = minVert(1:14);

meanHori = mean(green, 1);
[maxHori, minHori] = peakdet(meanHori, 0.5);
minHori = sortrows(minHori, 2);
minHori = minHori(1:10,:);
minHori = sortrows(minHori, 1);
minHori = minHori(:,1);
minHori = minHori(1:7);

h = "";
v = "";
for a=1:length(minHori)
	h = strcat(h, int2str(minHori(a)), ",");
end
for a=1:length(minVert)
	v = strcat(v, int2str(minVert(a)), ",");
end
h(end) = [];
v(end) = [];
str =strcat('{"x": [', h, '],"y":[', v ,']}');
disp(str);
