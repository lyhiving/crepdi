$('#capa1').mousedown(function(e)
                      {
                        var mousex = e.pageX - this.offsetLeft;
                        var mousey = e.pageY - this.offsetTop;
                        alert("coordenada x :" + mousex + "\n coordenada y :"+ mousey );
                        });