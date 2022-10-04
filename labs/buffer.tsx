const delta = React.useMemo(() => {
  if (ping && ping.time && pong && pong.time) return pong.time - ping.time;
}, [ping, pong]);
