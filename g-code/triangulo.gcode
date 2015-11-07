G21         ; Set units to mm
G90         ; Absolute positioning
G1 Z0.9999999999999999 F2540      ; Move to clearance level

;
; Operation:    0
; Name:         
; Type:         Inside
; Paths:        1
; Direction:    Conventional
; Cut Depth:    3.175
; Pass Depth:   3.175
; Plunge rate:  127
; Cut rate:     1016
;

; Path 0
; Rapid to initial position
G1 X92.3910 Y-88.8307 F2540
G1 Z0.0000
; plunge
G1 Z-1.00 F127
; cut
G1 X14.6172 Y-88.8307 F1016
G1 X53.5041 Y-21.4765
G1 X92.3910 Y-88.8307
; Retract
G1 Z1.0000 F2540
