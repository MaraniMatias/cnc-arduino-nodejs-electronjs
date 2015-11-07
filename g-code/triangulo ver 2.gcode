G21         ; Set units to mm
G90         ; Absolute positioning
G1 Z2.54 F2540      ; Move to clearance level

;
; Operation:    0
; Name:         
; Type:         Pocket
; Paths:        1
; Direction:    Conventional
; Cut Depth:    0.9999999999999999
; Pass Depth:   3.175
; Plunge rate:  127
; Cut rate:     1016
;

; Path 0
; Rapid to initial position
G1 X95.3046 Y-90.5124 F2540
G1 Z0.0000
; plunge
G1 Z-1.0000 F127
; cut
G1 X11.7036 Y-90.5124 F1016
G1 X53.5041 Y-18.1120
G1 X95.3046 Y-90.5124
G1 X94.5335 Y-90.0902
G1 X94.5581 Y-90.0463
G1 X94.5784 Y-90.0001
G1 X94.5937 Y-89.9523
G1 X94.6043 Y-89.9030
G1 X94.6097 Y-89.8528
G1 X94.6102 Y-89.8025
G1 X94.6053 Y-89.7524
G1 X94.5957 Y-89.7029
G1 X94.5812 Y-89.6546
G1 X94.5617 Y-89.6082
G1 X94.5436 Y-89.5736
G1 X53.9372 Y-19.2405
G1 X53.9097 Y-19.1981
G1 X53.8782 Y-19.1587
G1 X53.8429 Y-19.1229
G1 X53.8043 Y-19.0906
G1 X53.7624 Y-19.0624
G1 X53.7182 Y-19.0386
G1 X53.6715 Y-19.0193
G1 X53.6232 Y-19.0048
G1 X53.5739 Y-18.9954
G1 X53.5236 Y-18.9908
G1 X53.4733 Y-18.9913
G1 X53.4233 Y-18.9969
G1 X53.3740 Y-19.0076
G1 X53.3260 Y-19.0233
G1 X53.2798 Y-19.0434
G1 X53.2361 Y-19.0683
G1 X53.1950 Y-19.0975
G1 X53.1569 Y-19.1305
G1 X53.1226 Y-19.1673
G1 X53.0918 Y-19.2072
G1 X53.0710 Y-19.2405
G1 X12.4645 Y-89.5736
G1 X12.4417 Y-89.6183
G1 X12.4234 Y-89.6653
G1 X12.4097 Y-89.7138
G1 X12.4013 Y-89.7636
G1 X12.3977 Y-89.8139
G1 X12.3993 Y-89.8642
G1 X12.4059 Y-89.9140
G1 X12.4176 Y-89.9630
G1 X12.4341 Y-90.0107
G1 X12.4551 Y-90.0565
G1 X12.4808 Y-90.0996
G1 X12.5108 Y-90.1403
G1 X12.5446 Y-90.1776
G1 X12.5821 Y-90.2114
G1 X12.6225 Y-90.2411
G1 X12.6660 Y-90.2668
G1 X12.7119 Y-90.2879
G1 X12.7594 Y-90.3041
G1 X12.8085 Y-90.3155
G1 X12.8585 Y-90.3219
G1 X12.8976 Y-90.3237
G1 X94.1106 Y-90.3237
G1 X94.1608 Y-90.3211
G1 X94.2106 Y-90.3135
G1 X94.2594 Y-90.3008
G1 X94.3066 Y-90.2835
G1 X94.3521 Y-90.2614
G1 X94.3948 Y-90.2348
G1 X94.4349 Y-90.2040
G1 X94.4715 Y-90.1695
G1 X94.5045 Y-90.1314
G1 X94.5335 Y-90.0902
; Retract
G1 Z2.5400 F2540
