import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion.jsx'
import { Plus, Trash2, FileText, Calculator, User, Zap, Camera, Folder } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { services, categories } from './data/services.js'
import { problemasEletricos, outrosProblemas } from './data/problems.js'
import './App.css'

const carregarLogo = async () => {
  const response = await fetch('/logo.png');
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

function App() {
  // Estados principais
  const [currentTab, setCurrentTab] = useState('cliente')
  const [cliente, setCliente] = useState({ nome: '', contato: '', endereco: '' })
  const [servicosSelecionados, setServicosSelecionados] = useState([])
  const [servicosManuais, setServicosManuais] = useState([])
  const [despesasExtras, setDespesasExtras] = useState([])
  const [observacoesGerais, setObservacoesGerais] = useState('')
  const [novoServicoManual, setNovoServicoManual] = useState({ nome: '', descricao: '', quantidade: '', preco_unitario: '' })
  const [novaDespesa, setNovaDespesa] = useState({ descricao: '', valor: '' })
  const [problemasEletricosSelecionados, setProblemasEletricosSelecionados] = useState([])
  const [outrosProblemasSelecionados, setOutrosProblemasSelecionados] = useState([])
  const [descricaoRelatorio, setDescricaoRelatorio] = useState('')
  const [fotosRelatorio, setFotosRelatorio] = useState([])
  const [servicosRelatorioSelecionados, setServicosRelatorioSelecionados] = useState([])
  const [servicosRelatorioManuais, setServicosRelatorioManuais] = useState([])
  const [novoServicoRelatorioManual, setNovoServicoRelatorioManual] = useState({ nome: '', descricao: '', quantidade: '', unidade: 'un', foto: '' })
  const [desconto, setDesconto] = useState(0)

  const [arquivos, setArquivos] = useState(() => {
    const saved = localStorage.getItem('arquivos')
    return saved ? JSON.parse(saved) : {}
  })

  const salvarArquivo = (clienteNome, tipo, pdf, nome) => {
    const key = clienteNome || 'Sem nome'
    const novos = { ...arquivos }
    if (!novos[key]) {
      novos[key] = { orcamentos: [], relatorios: [] }
    }
    novos[key][tipo].push({ data: new Date().toLocaleDateString('pt-BR'), pdf, nome })
    setArquivos(novos)
    localStorage.setItem('arquivos', JSON.stringify(novos))
  }

  const removerArquivo = (clienteNome, tipo, index) => {
    const novos = { ...arquivos }
    if (!novos[clienteNome]) return
    novos[clienteNome][tipo] = novos[clienteNome][tipo].filter((_, i) => i !== index)
    if (novos[clienteNome].orcamentos.length === 0 && novos[clienteNome].relatorios.length === 0) {
      delete novos[clienteNome]
    }
    setArquivos(novos)
    localStorage.setItem('arquivos', JSON.stringify(novos))
  }

  // Função para adicionar/remover serviços selecionados
  const toggleServico = (servico) => {
    const existe = servicosSelecionados.find(s => s.id === servico.id)
    if (existe) {
      setServicosSelecionados(servicosSelecionados.filter(s => s.id !== servico.id))
    } else {
      setServicosSelecionados([...servicosSelecionados, {
        ...servico,
        preco_unitario: servico.preco_padrao,
        quantidade: 1,
        observacoes: ''
      }])
    }
  }

  // Função para atualizar preço de um serviço selecionado
  const atualizarPrecoServico = (id, novoPreco) => {
    setServicosSelecionados(servicosSelecionados.map(s =>
      s.id === id ? { ...s, preco_unitario: parseFloat(novoPreco) || 0 } : s
    ))
  }

  // Função para atualizar quantidade de um serviço selecionado
  const atualizarQuantidadeServico = (id, novaQuantidade) => {
    setServicosSelecionados(servicosSelecionados.map(s =>
      s.id === id ? { ...s, quantidade: parseFloat(novaQuantidade) || 0 } : s
    ))
  }

  // Função para atualizar observações de um serviço selecionado
  const atualizarObservacoesServico = (id, observacoes) => {
    setServicosSelecionados(servicosSelecionados.map(s => 
      s.id === id ? { ...s, observacoes } : s
    ))
  }

  // Função para adicionar serviço manual
  const adicionarServicoManual = () => {
    if (novoServicoManual.nome && novoServicoManual.quantidade && novoServicoManual.preco_unitario) {
      setServicosManuais([
        ...servicosManuais,
        {
          id: Date.now().toString(),
          nome: novoServicoManual.nome,
          descricao: novoServicoManual.descricao,
          quantidade: parseFloat(novoServicoManual.quantidade) || 0,
          preco_unitario: parseFloat(novoServicoManual.preco_unitario) || 0
        }
      ])
      setNovoServicoManual({ nome: '', descricao: '', quantidade: '', preco_unitario: '' })
    }
  }

  // Função para remover serviço manual
  const removerServicoManual = (id) => {
    setServicosManuais(servicosManuais.filter(s => s.id !== id))
  }

  // Função para adicionar despesa extra
  const adicionarDespesaExtra = () => {
    if (novaDespesa.descricao && novaDespesa.valor) {
      setDespesasExtras([...despesasExtras, {
        id: Date.now().toString(),
        ...novaDespesa,
        valor: parseFloat(novaDespesa.valor) || 0
      }])
      setNovaDespesa({ descricao: '', valor: '' })
    }
  }

  // Função para remover despesa extra
  const removerDespesaExtra = (id) => {
    setDespesasExtras(despesasExtras.filter(d => d.id !== id))
  }

  // Funções para serviços do relatório
  const toggleServicoRelatorio = (servico) => {
    const existe = servicosRelatorioSelecionados.find(s => s.id === servico.id)
    if (existe) {
      setServicosRelatorioSelecionados(servicosRelatorioSelecionados.filter(s => s.id !== servico.id))
    } else {
      setServicosRelatorioSelecionados([
        ...servicosRelatorioSelecionados,
        { ...servico, quantidade: 1, descricao: '', foto: '' }
      ])
    }
  }

  const atualizarQuantidadeServicoRelatorio = (id, novaQuantidade) => {
    setServicosRelatorioSelecionados(
      servicosRelatorioSelecionados.map(s =>
        s.id === id ? { ...s, quantidade: parseFloat(novaQuantidade) || 0 } : s
      )
    )
  }

  const atualizarDescricaoServicoRelatorio = (id, descricao) => {
    setServicosRelatorioSelecionados(
      servicosRelatorioSelecionados.map(s =>
        s.id === id ? { ...s, descricao } : s
      )
    )
  }

  const adicionarFotoServicoRelatorio = (id, e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setServicosRelatorioSelecionados(
        servicosRelatorioSelecionados.map(s =>
          s.id === id ? { ...s, foto: reader.result } : s
        )
      )
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleFotoNovoServicoRelatorioManual = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setNovoServicoRelatorioManual({ ...novoServicoRelatorioManual, foto: reader.result })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const adicionarServicoRelatorioManual = () => {
    if (novoServicoRelatorioManual.nome && novoServicoRelatorioManual.quantidade) {
      setServicosRelatorioManuais([
        ...servicosRelatorioManuais,
        {
          id: Date.now().toString(),
          nome: novoServicoRelatorioManual.nome,
          descricao: novoServicoRelatorioManual.descricao,
          quantidade: parseFloat(novoServicoRelatorioManual.quantidade) || 0,
          unidade: novoServicoRelatorioManual.unidade || 'un',
          foto: novoServicoRelatorioManual.foto
        }
      ])
      setNovoServicoRelatorioManual({ nome: '', descricao: '', quantidade: '', unidade: 'un', foto: '' })
    }
  }

  const removerServicoRelatorioManual = (id) => {
    setServicosRelatorioManuais(servicosRelatorioManuais.filter(s => s.id !== id))
  }

  // Funções para relatório
  const toggleSelecao = (item, lista, setLista) => {
    const existe = lista.find(p => p.problema === item)
    if (existe) {
      setLista(lista.filter(p => p.problema !== item))
    } else {
      setLista([...lista, { problema: item, descricao: '', foto: '' }])
    }
  }

  const atualizarDescricaoProblema = (item, descricao, lista, setLista) => {
    setLista(lista.map(p =>
      p.problema === item ? { ...p, descricao } : p
    ))
  }

  const adicionarFotoProblema = (item, e, lista, setLista) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setLista(lista.map(p =>
        p.problema === item ? { ...p, foto: reader.result } : p
      ))
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const adicionarFotoRelatorio = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setFotosRelatorio([...fotosRelatorio, { id: Date.now(), src: reader.result, descricao: '' }])
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const atualizarDescricaoFoto = (id, descricao) => {
    setFotosRelatorio(fotosRelatorio.map(f => f.id === id ? { ...f, descricao } : f))
  }

  // Calcular valor total
  const calcularTotal = () => {
    const totalServicos = servicosSelecionados.reduce((acc, s) => acc + (s.preco_unitario * s.quantidade), 0)
    const totalManuais = servicosManuais.reduce((acc, s) => acc + (s.preco_unitario * s.quantidade), 0)
    const totalDespesas = despesasExtras.reduce((acc, d) => acc + d.valor, 0)
    return totalServicos + totalManuais + totalDespesas
  }

  // Função para gerar orçamento
  const gerarOrcamento = () => {
    if (!cliente.nome) {
      alert('Por favor, preencha o nome do cliente antes de gerar o orçamento.')
      return
    }
    const subtotal = calcularTotal()
    const valorTotal = subtotal * (1 - desconto / 100)
    const orcamento = {
      cliente,
      servicosSelecionados,
      servicosManuais,
      despesasExtras,
      observacoesGerais,
      desconto,
      subtotal,
      valorTotal,
      dataCriacao: new Date().toLocaleDateString('pt-BR')
    }

    console.log('Orçamento gerado:', orcamento)

    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Orçamento de Serviços Elétricos', 14, 20)

    doc.setFontSize(12)
    doc.text(`Cliente: ${orcamento.cliente.nome}`, 14, 30)
    doc.text(`Contato: ${orcamento.cliente.contato}`, 14, 37)
    if (orcamento.cliente.endereco) {
      doc.text(`Endereço: ${orcamento.cliente.endereco}`, 14, 44)
    }
    doc.text(`Data: ${orcamento.dataCriacao}`, 14, 51)

    autoTable(doc, {
      startY: 60,
      head: [['Serviço', 'Qtd / m²', 'Observações', 'Preço']],
      body: [
        ...orcamento.servicosSelecionados.map(s => [
          s.nome,
          s.categoria === 'Laudos' ? `${s.quantidade} m²` : s.quantidade,
          s.observacoes || '',
          `R$ ${(s.preco_unitario * s.quantidade).toFixed(2)}`
        ]),
        ...orcamento.servicosManuais.map(s => [
          s.nome,
          s.quantidade,
          s.descricao || '',
          `R$ ${(s.preco_unitario * s.quantidade).toFixed(2)}`
        ])
      ]
    })

    let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 60

    if (orcamento.despesasExtras.length > 0) {
      autoTable(doc, {
        startY: finalY + 10,
        head: [['Despesa', 'Valor']],
        body: orcamento.despesasExtras.map(d => [d.descricao, `R$ ${d.valor.toFixed(2)}`])
      })
      finalY = doc.lastAutoTable.finalY
    }

    if (orcamento.observacoesGerais) {
      doc.text(`Observações: ${orcamento.observacoesGerais}`, 14, finalY + 10)
      finalY += 16
    }

    doc.setFontSize(14)
    if (desconto > 0) {
      doc.text(`Subtotal: R$ ${subtotal.toFixed(2)}`, 14, finalY + 20)
      doc.text(`Desconto (${desconto}%): -R$ ${(subtotal - valorTotal).toFixed(2)}`, 14, finalY + 27)
      doc.text(`Total: R$ ${valorTotal.toFixed(2)}`, 14, finalY + 34)
    } else {
      doc.text(`Total: R$ ${valorTotal.toFixed(2)}`, 14, finalY + 20)
    }

    const pdf = doc.output('datauristring')
    salvarArquivo(orcamento.cliente.nome, 'orcamentos', pdf, `orcamento-${orcamento.cliente.nome || 'cliente'}.pdf`)
    doc.save(`orcamento-${orcamento.cliente.nome || 'cliente'}.pdf`)
    alert('Orçamento gerado em PDF com sucesso!')
  }

  // Função para gerar relatório
  const gerarRelatorio = () => {
    if (!cliente.nome) {
      alert('Por favor, preencha o nome do cliente antes de gerar o relatório.')
      return
    }
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Relatório de Inspeção', 14, 20)

    doc.setFontSize(12)
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30)

    let y = 40

    if (problemasEletricosSelecionados.length > 0) {
      doc.text('Problemas Elétricos:', 14, y)
      y += 6
      problemasEletricosSelecionados.forEach(p => {
        doc.text(`- ${p.problema}`, 16, y)
        y += 6
        if (p.descricao) {
          const linhas = doc.splitTextToSize(p.descricao, 180)
          doc.text(linhas, 18, y)
          y += linhas.length * 6
        }
        if (p.foto) {
          const props = doc.getImageProperties(p.foto)
          const w = 180
          const h = props.height * w / props.width
          if (y + h > 280) {
            doc.addPage()
            y = 20
          }
          doc.addImage(p.foto, props.fileType || 'JPEG', 14, y, w, h)
          y += h + 4
        }
      })
    }

    if (outrosProblemasSelecionados.length > 0) {
      doc.text('Outros Problemas:', 14, y)
      y += 6
      outrosProblemasSelecionados.forEach(p => {
        doc.text(`- ${p.problema}`, 16, y)
        y += 6
        if (p.descricao) {
          const linhas = doc.splitTextToSize(p.descricao, 180)
          doc.text(linhas, 18, y)
          y += linhas.length * 6
        }
        if (p.foto) {
          const props = doc.getImageProperties(p.foto)
          const w = 180
          const h = props.height * w / props.width
          if (y + h > 280) {
            doc.addPage()
            y = 20
          }
          doc.addImage(p.foto, props.fileType || 'JPEG', 14, y, w, h)
          y += h + 4
        }
      })
    }

    if (servicosRelatorioSelecionados.length > 0 || servicosRelatorioManuais.length > 0) {
      doc.text('Serviços Recomendados:', 14, y)
      y += 6
      servicosRelatorioSelecionados.forEach(s => {
        const unidade = s.categoria === 'Laudos'
          ? 'm²'
          : s.categoria === 'Passagem de Cabos e Eletrodutos'
            ? 'm'
            : 'un'
        const texto = `- ${s.nome} (${s.quantidade} ${unidade})${s.descricao ? ' - ' + s.descricao : ''}`
        doc.text(texto, 16, y)
        y += 6
        if (s.foto) {
          const props = doc.getImageProperties(s.foto)
          const w = 180
          const h = props.height * w / props.width
          if (y + h > 280) {
            doc.addPage()
            y = 20
          }
          doc.addImage(s.foto, props.fileType || 'JPEG', 14, y, w, h)
          y += h + 4
        }
      })
      servicosRelatorioManuais.forEach(s => {
        const texto = `- ${s.nome} (${s.quantidade} ${s.unidade || 'un'})${s.descricao ? ' - ' + s.descricao : ''}`
        doc.text(texto, 16, y)
        y += 6
        if (s.foto) {
          const props = doc.getImageProperties(s.foto)
          const w = 180
          const h = props.height * w / props.width
          if (y + h > 280) {
            doc.addPage()
            y = 20
          }
          doc.addImage(s.foto, props.fileType || 'JPEG', 14, y, w, h)
          y += h + 4
        }
      })
    }

    if (descricaoRelatorio) {
      doc.text('Observações:', 14, y)
      y += 6
      const linhas = doc.splitTextToSize(descricaoRelatorio, 180)
      doc.text(linhas, 16, y)
      y += linhas.length * 6 + 4
    }

    fotosRelatorio.forEach(foto => {
      const props = doc.getImageProperties(foto.src)
      const w = 180
      const h = props.height * w / props.width
      if (y + h > 280) {
        doc.addPage()
        y = 20
      }
      doc.addImage(foto.src, props.fileType || 'JPEG', 14, y, w, h)
      y += h + 4
      if (foto.descricao) {
        const texto = doc.splitTextToSize(foto.descricao, 180)
        if (y + texto.length * 6 > 280) {
          doc.addPage()
          y = 20
        }
        doc.text(texto, 14, y)
        y += texto.length * 6 + 4
      }
    })

    const pdf = doc.output('datauristring')
    salvarArquivo(cliente.nome, 'relatorios', pdf, `relatorio-${cliente.nome || 'cliente'}.pdf`)
    doc.save(`relatorio-${cliente.nome || 'cliente'}.pdf`)
    alert('Relatório gerado em PDF com sucesso!')
  }

  // Função para limpar formulário
  const limparFormulario = () => {
    setCliente({ nome: '', contato: '', endereco: '' })
    setServicosSelecionados([])
    setServicosManuais([])
    setDespesasExtras([])
    setObservacoesGerais('')
    setDesconto(0)
    setServicosRelatorioSelecionados([])
    setServicosRelatorioManuais([])
    setNovoServicoRelatorioManual({ nome: '', descricao: '', quantidade: '', unidade: 'un', foto: '' })
    setProblemasEletricosSelecionados([])
    setOutrosProblemasSelecionados([])
    setDescricaoRelatorio('')
    setFotosRelatorio([])
    setCurrentTab('cliente')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Orçamento Elétrico</h1>
          </div>
          <p className="text-gray-600">Sistema para geração de orçamentos de serviços elétricos</p>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="flex flex-wrap w-full h-auto gap-2">
            <TabsTrigger value="cliente" className="flex items-center gap-2 text-xs sm:text-sm whitespace-normal">
              <User className="h-4 w-4" />
              Cliente
            </TabsTrigger>
            <TabsTrigger value="servicos" className="flex items-center gap-2 text-xs sm:text-sm whitespace-normal">
              <Zap className="h-4 w-4" />
              Serviços
            </TabsTrigger>
            <TabsTrigger value="extras" className="flex items-center gap-2 text-xs sm:text-sm whitespace-normal">
              <Plus className="h-4 w-4" />
              Extras
            </TabsTrigger>
            <TabsTrigger value="orcamento" className="flex items-center gap-2 text-xs sm:text-sm whitespace-normal">
              <Calculator className="h-4 w-4" />
              Orçamento
            </TabsTrigger>
            <TabsTrigger value="relatorio" className="flex items-center gap-2 text-xs sm:text-sm whitespace-normal">
              <Camera className="h-4 w-4" />
              Relatório
            </TabsTrigger>
            <TabsTrigger value="arquivos" className="flex items-center gap-2 text-xs sm:text-sm whitespace-normal">
              <Folder className="h-4 w-4" />
              Arquivos
            </TabsTrigger>
          </TabsList>

          {/* Aba Cliente */}
          <TabsContent value="cliente" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Cliente</CardTitle>
                <CardDescription>Informe os dados do cliente para o orçamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={cliente.nome}
                    onChange={(e) => setCliente({...cliente, nome: e.target.value})}
                    placeholder="Nome do cliente"
                  />
                </div>
                <div>
                  <Label htmlFor="contato">Contato</Label>
                  <Input
                    id="contato"
                    value={cliente.contato}
                    onChange={(e) => setCliente({ ...cliente, contato: e.target.value })}
                    placeholder="Telefone ou email"
                  />
                </div>
                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={cliente.endereco}
                    onChange={(e) => setCliente({...cliente, endereco: e.target.value})}
                    placeholder="Endereço do cliente"
                  />
                </div>
                <Button
                  onClick={() => setCurrentTab('servicos')}
                  disabled={!cliente.nome}
                  className="w-full"
                >
                  Próximo: Selecionar Serviços
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Serviços */}
          <TabsContent value="servicos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Serviços Disponíveis</CardTitle>
                <CardDescription>Selecione os serviços que serão executados</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {categories.map(categoria => (
                    <AccordionItem key={categoria} value={categoria}>
                      <AccordionTrigger className="text-lg font-semibold text-blue-600">{categoria}</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-3">
                          {services.filter(s => s.categoria === categoria).map(servico => {
                            const selecionado = servicosSelecionados.find(s => s.id === servico.id)
                            return (
                              <div key={servico.id} className="border rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    checked={!!selecionado}
                                    onCheckedChange={() => toggleServico(servico)}
                                  />
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <h4 className="font-medium">{servico.nome}</h4>
                                        <p className="text-sm text-gray-600">{servico.descricao}</p>
                                      </div>
                                      <Badge variant="secondary">
                                        {servico.categoria === 'Laudos'
                                          ? `R$ ${servico.preco_padrao.toFixed(2)}/m²`
                                          : `R$ ${servico.preco_padrao.toFixed(2)}`
                                        }
                                      </Badge>
                                    </div>

                                    {selecionado && (
                                      <div className="mt-3 space-y-2">
                                        <div>
                                          <Label htmlFor={`quantidade-${servico.id}`}>
                                            {servico.categoria === 'Laudos' ? 'Metros²' : 'Quantidade'}
                                          </Label>
                                          <Input
                                            id={`quantidade-${servico.id}`}
                                            type="number"
                                            min="0"
                                            step={servico.categoria === 'Laudos' ? '0.01' : '1'}
                                            value={selecionado.quantidade}
                                            onChange={(e) => atualizarQuantidadeServico(servico.id, e.target.value)}
                                            className="w-24"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor={`preco-${servico.id}`}>Preço para este orçamento</Label>
                                          <Input
                                            id={`preco-${servico.id}`}
                                            type="number"
                                            step="0.01"
                                            value={selecionado.preco_unitario}
                                            onChange={(e) => atualizarPrecoServico(servico.id, e.target.value)}
                                            className="w-32"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor={`obs-${servico.id}`}>Observações</Label>
                                          <Textarea
                                            id={`obs-${servico.id}`}
                                            value={selecionado.observacoes}
                                            onChange={(e) => atualizarObservacoesServico(servico.id, e.target.value)}
                                            placeholder="Observações específicas para este serviço"
                                            rows={2}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <div className="flex gap-2 mt-6">
                  <Button variant="outline" onClick={() => setCurrentTab('cliente')}>
                    Voltar
                  </Button>
                  <Button onClick={() => setCurrentTab('extras')} className="flex-1">
                    Próximo: Serviços Extras
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Extras */}
          <TabsContent value="extras" className="space-y-4">
            {/* Serviços Manuais */}
            <Card>
              <CardHeader>
                <CardTitle>Serviços Adicionais</CardTitle>
                <CardDescription>Adicione serviços que não estão na lista padrão</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="nome-manual">Nome do Serviço</Label>
                    <Input
                      id="nome-manual"
                      value={novoServicoManual.nome}
                      onChange={(e) => setNovoServicoManual({ ...novoServicoManual, nome: e.target.value })}
                      placeholder="Ex: Instalação especial"
                    />
                  </div>
                  <div>
                    <Label htmlFor="descricao-manual">Descrição</Label>
                    <Input
                      id="descricao-manual"
                      value={novoServicoManual.descricao}
                      onChange={(e) => setNovoServicoManual({ ...novoServicoManual, descricao: e.target.value })}
                      placeholder="Descrição do serviço"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantidade-manual">Qtd / m²</Label>
                    <Input
                      id="quantidade-manual"
                      type="number"
                      step="0.01"
                      value={novoServicoManual.quantidade}
                      onChange={(e) => setNovoServicoManual({ ...novoServicoManual, quantidade: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preco-manual">Valor unitário</Label>
                    <div className="flex gap-2">
                      <Input
                        id="preco-manual"
                        type="number"
                        step="0.01"
                        value={novoServicoManual.preco_unitario}
                        onChange={(e) => setNovoServicoManual({ ...novoServicoManual, preco_unitario: e.target.value })}
                        placeholder="0.00"
                      />
                      <Button onClick={adicionarServicoManual} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {servicosManuais.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Serviços Adicionados:</h4>
                    {servicosManuais.map(servico => (
                      <div key={servico.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <span className="font-medium">{servico.nome}</span>
                          {servico.descricao && <span className="text-gray-600 ml-2">- {servico.descricao}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{`${servico.quantidade} x R$ ${servico.preco_unitario.toFixed(2)} = R$ ${(servico.quantidade * servico.preco_unitario).toFixed(2)}`}</Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removerServicoManual(servico.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Despesas Extras */}
            <Card>
              <CardHeader>
                <CardTitle>Despesas Extras</CardTitle>
                <CardDescription>Adicione despesas como combustível, deslocamento, etc.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="descricao-despesa">Descrição</Label>
                    <Input
                      id="descricao-despesa"
                      value={novaDespesa.descricao}
                      onChange={(e) => setNovaDespesa({...novaDespesa, descricao: e.target.value})}
                      placeholder="Ex: Combustível, Deslocamento"
                    />
                  </div>
                  <div>
                    <Label htmlFor="valor-despesa">Valor</Label>
                    <div className="flex gap-2">
                      <Input
                        id="valor-despesa"
                        type="number"
                        step="0.01"
                        value={novaDespesa.valor}
                        onChange={(e) => setNovaDespesa({...novaDespesa, valor: e.target.value})}
                        placeholder="0.00"
                      />
                      <Button onClick={adicionarDespesaExtra} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {despesasExtras.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Despesas Adicionadas:</h4>
                    {despesasExtras.map(despesa => (
                      <div key={despesa.id} className="flex justify-between items-center p-3 border rounded">
                        <span>{despesa.descricao}</span>
                        <div className="flex items-center gap-2">
                          <Badge>R$ {despesa.valor.toFixed(2)}</Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removerDespesaExtra(despesa.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Observações Gerais */}
            <Card>
              <CardHeader>
                <CardTitle>Observações Gerais</CardTitle>
                <CardDescription>Adicione observações gerais sobre o orçamento</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={observacoesGerais}
                  onChange={(e) => setObservacoesGerais(e.target.value)}
                  placeholder="Observações gerais sobre o orçamento..."
                  rows={4}
                />
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentTab('servicos')}>
                Voltar
              </Button>
              <Button onClick={() => setCurrentTab('orcamento')} className="flex-1">
                Finalizar: Ver Orçamento
              </Button>
            </div>
          </TabsContent>

          {/* Aba Orçamento */}
          <TabsContent value="orcamento" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Orçamento Final
                </CardTitle>
                <CardDescription>Resumo do orçamento gerado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dados do Cliente */}
                <div>
                  <h3 className="font-semibold mb-2">Cliente:</h3>
                  <p><strong>Nome:</strong> {cliente.nome}</p>
                  <p><strong>Contato:</strong> {cliente.contato}</p>
                  {cliente.endereco && <p><strong>Endereço:</strong> {cliente.endereco}</p>}
                </div>

                <Separator />

                {/* Serviços Selecionados */}
                {servicosSelecionados.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Serviços Selecionados:</h3>
                    <div className="space-y-2">
                      {servicosSelecionados.map(servico => (
                        <div key={servico.id} className="flex justify-between items-start p-3 border rounded">
                          <div className="flex-1">
                            <p className="font-medium">{servico.nome}</p>
                            <p className="text-sm text-gray-600">{servico.descricao}</p>
                            {servico.observacoes && (
                              <p className="text-sm text-blue-600 mt-1">Obs: {servico.observacoes}</p>
                            )}
                          </div>
                          <Badge>
                            {servico.categoria === 'Laudos'
                              ? `${servico.quantidade} m² x R$ ${servico.preco_unitario.toFixed(2)} = R$ ${(servico.preco_unitario * servico.quantidade).toFixed(2)}`
                              : `${servico.quantidade}x R$ ${servico.preco_unitario.toFixed(2)} = R$ ${(servico.preco_unitario * servico.quantidade).toFixed(2)}`
                            }
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Serviços Manuais */}
                {servicosManuais.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Serviços Adicionais:</h3>
                    <div className="space-y-2">
                      {servicosManuais.map(servico => (
                        <div key={servico.id} className="flex justify-between items-start p-3 border rounded">
                          <div>
                            <p className="font-medium">{servico.nome}</p>
                            {servico.descricao && <p className="text-sm text-gray-600">{servico.descricao}</p>}
                          </div>
                          <Badge>{`${servico.quantidade} x R$ ${servico.preco_unitario.toFixed(2)} = R$ ${(servico.quantidade * servico.preco_unitario).toFixed(2)}`}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Despesas Extras */}
                {despesasExtras.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Despesas Extras:</h3>
                    <div className="space-y-2">
                      {despesasExtras.map(despesa => (
                        <div key={despesa.id} className="flex justify-between items-center p-3 border rounded">
                          <span>{despesa.descricao}</span>
                          <Badge>R$ {despesa.valor.toFixed(2)}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observações Gerais */}
                {observacoesGerais && (
                  <div>
                    <h3 className="font-semibold mb-2">Observações Gerais:</h3>
                    <p className="text-gray-700 p-3 border rounded bg-gray-50">{observacoesGerais}</p>
                  </div>
                )}

                <Separator />

                {/* Desconto */}
                <div className="flex justify-end items-center gap-2">
                  <Label htmlFor="desconto">Desconto (%)</Label>
                  <Input
                    id="desconto"
                    type="number"
                    className="w-24"
                    value={desconto}
                    onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                  />
                </div>

                {/* Total */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    Total: R$ {(calcularTotal() * (1 - desconto / 100)).toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600">Data: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setCurrentTab('extras')}>
                    Voltar
                  </Button>
                  <Button onClick={gerarOrcamento} className="flex-1" disabled={!cliente.nome}>
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar Orçamento
                  </Button>
                  <Button variant="outline" onClick={limparFormulario}>
                    Novo Orçamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Relatório */}
          <TabsContent value="relatorio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Serviços Necessários
                </CardTitle>
                <CardDescription>Selecione os serviços recomendados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Accordion type="multiple" className="w-full">
                  {categories.map(categoria => (
                    <AccordionItem key={categoria} value={categoria}>
                      <AccordionTrigger className="font-semibold">{categoria}</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-4">
                          {services.filter(s => s.categoria === categoria).map(servico => {
                            const selecionado = servicosRelatorioSelecionados.find(s => s.id === servico.id)
                            const isLaudo = servico.categoria === 'Laudos'
                            const isCabo = servico.categoria === 'Passagem de Cabos e Eletrodutos'
                            const label = isLaudo ? 'Metros²' : isCabo ? 'Metros' : 'Quantidade'
                            return (
                              <div key={servico.id} className="border rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={!!selecionado}
                                    onCheckedChange={() => toggleServicoRelatorio(servico)}
                                  />
                                  <div>
                                    <h4 className="font-medium">{servico.nome}</h4>
                                    {servico.descricao && (
                                      <p className="text-sm text-gray-600">{servico.descricao}</p>
                                    )}
                                  </div>
                                </div>
                                {selecionado && (
                                  <div className="mt-4 space-y-2">
                                    <Label htmlFor={`quantidade-rel-${servico.id}`}>{label}</Label>
                                    <Input
                                      id={`quantidade-rel-${servico.id}`}
                                      type="number"
                                      min="0"
                                      step={(isLaudo || isCabo) ? '0.01' : '1'}
                                      value={selecionado.quantidade}
                                      onChange={(e) => atualizarQuantidadeServicoRelatorio(servico.id, e.target.value)}
                                    />
                                    <Label htmlFor={`descricao-servico-rel-${servico.id}`}>Descrição</Label>
                                    <Textarea
                                      id={`descricao-servico-rel-${servico.id}`}
                                      value={selecionado.descricao}
                                      onChange={(e) => atualizarDescricaoServicoRelatorio(servico.id, e.target.value)}
                                      rows={2}
                                    />
                                    <Label htmlFor={`foto-servico-rel-${servico.id}`}>Foto</Label>
                                    <Input
                                      id={`foto-servico-rel-${servico.id}`}
                                      type="file"
                                      accept="image/*"
                                      capture="environment"
                                      onChange={(e) => adicionarFotoServicoRelatorio(servico.id, e)}
                                    />
                                    {selecionado.foto && (
                                      <img
                                        src={selecionado.foto}
                                        alt="Evidência"
                                        className="w-full max-w-xs rounded"
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <div className="space-y-4">
                  <h3 className="font-semibold">Adicionar Serviço Manual</h3>
                  <div className="grid gap-2">
                    <Label htmlFor="nome-servico-relatorio">Nome</Label>
                    <Input
                      id="nome-servico-relatorio"
                      value={novoServicoRelatorioManual.nome}
                      onChange={(e) => setNovoServicoRelatorioManual({ ...novoServicoRelatorioManual, nome: e.target.value })}
                    />
                    <Label htmlFor="descricao-servico-relatorio">Descrição</Label>
                    <Input
                      id="descricao-servico-relatorio"
                      value={novoServicoRelatorioManual.descricao}
                      onChange={(e) => setNovoServicoRelatorioManual({ ...novoServicoRelatorioManual, descricao: e.target.value })}
                    />
                    <Label htmlFor="quantidade-servico-relatorio">Quantidade ou m²</Label>
                    <Input
                      id="quantidade-servico-relatorio"
                      type="number"
                      value={novoServicoRelatorioManual.quantidade}
                      onChange={(e) => setNovoServicoRelatorioManual({ ...novoServicoRelatorioManual, quantidade: e.target.value })}
                    />
                    <Label htmlFor="unidade-servico-relatorio">Unidade</Label>
                    <Input
                      id="unidade-servico-relatorio"
                      value={novoServicoRelatorioManual.unidade}
                      onChange={(e) => setNovoServicoRelatorioManual({ ...novoServicoRelatorioManual, unidade: e.target.value })}
                    />
                    <Label htmlFor="foto-servico-relatorio">Foto</Label>
                    <Input
                      id="foto-servico-relatorio"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFotoNovoServicoRelatorioManual}
                    />
                    {novoServicoRelatorioManual.foto && (
                      <img
                        src={novoServicoRelatorioManual.foto}
                        alt="Pré-visualização"
                        className="w-full max-w-xs rounded"
                      />
                    )}
                  </div>
                  <Button variant="outline" onClick={adicionarServicoRelatorioManual}>Adicionar</Button>

                  {servicosRelatorioManuais.length > 0 && (
                    <div className="space-y-2">
                      {servicosRelatorioManuais.map(servico => (
                        <div key={servico.id} className="p-3 border rounded space-y-2">
                          <div className="flex justify-between items-center">
                            <span>{`${servico.nome} - ${servico.quantidade} ${servico.unidade}`}</span>
                            <Button variant="ghost" size="icon" onClick={() => removerServicoRelatorioManual(servico.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {servico.descricao && (
                            <p className="text-sm text-gray-600">{servico.descricao}</p>
                          )}
                          {servico.foto && (
                            <img
                              src={servico.foto}
                              alt="Evidência"
                              className="w-full max-w-xs rounded"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Registro de Problemas
                </CardTitle>
                <CardDescription>Capture fotos e descreva problemas encontrados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="problemas-eletricos">
                    <AccordionTrigger className="font-semibold">Problemas Elétricos</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-4">
                        {problemasEletricos.map(p => {
                          const selecionado = problemasEletricosSelecionados.find(pe => pe.problema === p)
                          return (
                            <div key={p} className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <Checkbox
                                  checked={!!selecionado}
                                  onCheckedChange={() =>
                                    toggleSelecao(
                                      p,
                                      problemasEletricosSelecionados,
                                      setProblemasEletricosSelecionados
                                    )
                                  }
                                />
                                {p}
                              </Label>
                              {selecionado && (
                                <div className="pl-6 space-y-2">
                                  <Textarea
                                    value={selecionado.descricao}
                                    onChange={(e) =>
                                      atualizarDescricaoProblema(
                                        p,
                                        e.target.value,
                                        problemasEletricosSelecionados,
                                        setProblemasEletricosSelecionados
                                      )
                                    }
                                    placeholder="Descrição do problema"
                                    rows={2}
                                  />
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={(e) =>
                                      adicionarFotoProblema(
                                        p,
                                        e,
                                        problemasEletricosSelecionados,
                                        setProblemasEletricosSelecionados
                                      )
                                    }
                                  />
                                  {selecionado.foto && (
                                    <img
                                      src={selecionado.foto}
                                      alt="Evidência"
                                      className="w-full max-w-xs rounded"
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="outros-problemas">
                    <AccordionTrigger className="font-semibold">Outros Problemas</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-4">
                        {outrosProblemas.map(p => {
                          const selecionado = outrosProblemasSelecionados.find(op => op.problema === p)
                          return (
                            <div key={p} className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <Checkbox
                                  checked={!!selecionado}
                                  onCheckedChange={() =>
                                    toggleSelecao(
                                      p,
                                      outrosProblemasSelecionados,
                                      setOutrosProblemasSelecionados
                                    )
                                  }
                                />
                                {p}
                              </Label>
                              {selecionado && (
                                <div className="pl-6 space-y-2">
                                  <Textarea
                                    value={selecionado.descricao}
                                    onChange={(e) =>
                                      atualizarDescricaoProblema(
                                        p,
                                        e.target.value,
                                        outrosProblemasSelecionados,
                                        setOutrosProblemasSelecionados
                                      )
                                    }
                                    placeholder="Descrição do problema"
                                    rows={2}
                                  />
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={(e) =>
                                      adicionarFotoProblema(
                                        p,
                                        e,
                                        outrosProblemasSelecionados,
                                        setOutrosProblemasSelecionados
                                      )
                                    }
                                  />
                                  {selecionado.foto && (
                                    <img
                                      src={selecionado.foto}
                                      alt="Evidência"
                                      className="w-full max-w-xs rounded"
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div>
                  <Label htmlFor="descricao-relatorio">Descrição Adicional</Label>
                  <Textarea
                    id="descricao-relatorio"
                    value={descricaoRelatorio}
                    onChange={(e) => setDescricaoRelatorio(e.target.value)}
                    placeholder="Descreva detalhes adicionais"
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="foto-relatorio">Capturar Foto</Label>
                    <Input
                      id="foto-relatorio"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={adicionarFotoRelatorio}
                    />
                  </div>
                  {fotosRelatorio.map(foto => (
                    <div key={foto.id} className="space-y-2">
                      <img src={foto.src} alt="Evidência" className="w-full max-w-xs rounded" />
                      <Textarea
                        value={foto.descricao}
                        onChange={(e) => atualizarDescricaoFoto(foto.id, e.target.value)}
                        placeholder="Descrição da foto"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>

            <Button onClick={gerarRelatorio} className="w-full" disabled={!cliente.nome}>
              <FileText className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>
        </TabsContent>
        <TabsContent value="arquivos" className="space-y-4">
          {Object.keys(arquivos).length === 0 ? (
            <p className="text-gray-500">Nenhum documento salvo.</p>
          ) : (
            Object.entries(arquivos).map(([nome, dados]) => (
              <Card key={nome}>
                <CardHeader>
                  <CardTitle>{nome}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Orçamentos</h3>
                    {dados.orcamentos.length ? (
                      <ul className="list-disc pl-4">
                        {dados.orcamentos.map((o, i) => (
                          <li key={i} className="flex items-center justify-between gap-2">
                            <a
                              href={o.pdf}
                              download={o.nome}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {o.data}
                            </a>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removerArquivo(nome, 'orcamentos', i)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhum orçamento salvo</p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">Relatórios</h3>
                    {dados.relatorios.length ? (
                      <ul className="list-disc pl-4">
                        {dados.relatorios.map((r, i) => (
                          <li key={i} className="flex items-center justify-between gap-2">
                            <a
                              href={r.pdf}
                              download={r.nome}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {r.data}
                            </a>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removerArquivo(nome, 'relatorios', i)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhum relatório salvo</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App



// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

