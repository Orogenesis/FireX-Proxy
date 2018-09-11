start = (text / enclosedexpression)*

text =
  characters:$((!open) c:any)+ {
    return {
        type: 'text',
        value: characters
    }
  }

enclosedexpression =
  open ws* e:expression ws* close { return e; }

open = "{{"
close = "}}"
any = .

expression =
  main:variable args:parameter* {
    return {
      type: 'expression',
      path: main,
      args: args
    }
  }

parameter = ws+ a:argument { return a; }

argument = variable / string

string "string" =
  doublequote text:(doublequote_character*) doublequote {
    return { type: 'string', value: text.join('') };
  }
  / singlequote text:(singlequote_character*) singlequote {
    return { type: 'string', value: text.join('') };
  }

doublequote_character =
  (!doublequote) c:character { return c; }

singlequote_character =
  (!singlequote) c:character { return c; }

character =
  unescaped
  / escape_sequence

escape_sequence "escape sequence" = escape_character sequence:(
     doublequote
   / singlequote
   / "\\"
   / "/"
   / "b" { return "\b"; }
   / "f" { return "\f"; }
   / "n" { return "\n"; }
   / "r" { return "\r"; }
   / "t" { return "\t"; }
   / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
       return String.fromCharCode(parseInt(digits, 16));
     }
  )
  { return sequence; }

variable = $([0-9a-zA-Z_\$]+)

escape_character = "\\"
doublequote "double quote" = '"'
singlequote "single quote" = "'"
unescaped = [\x20-\x21\x23-\x5B\x5D-\u10FFFF]
HEXDIG = [0-9a-f]i

ws "whitespace" = [ \t]
