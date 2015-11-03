G21         ; Set units to mm
G90         ; Absolute positioning
G1 Z3 F2540      ; Move to clearance level

;
; Operation:    0
; Name:         
; Type:         Inside
; Paths:        1
; Direction:    Conventional
; Cut Depth:    3
; Pass Depth:   3.175
; Plunge rate:  127
; Cut rate:     1016
;

; Path 0
; Rapid to initial position
G1 X92.5426 Y-88.9180 F2540
G1 Z0.0000
; plunge
G1 Z-3.0000 F127
; cut
G1 X14.4656 Y-88.9180 F1016
G1 X53.5041 Y-21.3012
G1 X92.5426 Y-88.9180
; Retract
G1 Z3.0000 F2540
