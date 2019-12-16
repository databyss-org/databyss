echo "
rdr pass inet proto tcp from any to any port 80 -> 0.0.0.0 port 8080
" | sudo pfctl -ef -
