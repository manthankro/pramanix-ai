package com.aistudio.pramanix.ui.screens

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.aistudio.pramanix.data.model.ModuleId
import com.aistudio.pramanix.ui.components.PramanixDrawerContent
import com.aistudio.pramanix.ui.components.PramanixHeader
import com.aistudio.pramanix.ui.viewmodel.PramanixViewModel
import kotlinx.coroutines.launch

@Composable
fun MainScreen(
    viewModel: PramanixViewModel = viewModel(),
    modifier: Modifier = Modifier
) {
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    val currentModule by viewModel.currentModule.collectAsState()
    val projects by viewModel.projects.collectAsState()
    val activeProject by viewModel.activeProject.collectAsState()
    val repoData by viewModel.repoData.collectAsState()
    val isAnalyzing by viewModel.isAnalyzing.collectAsState()
    val chatMessages by viewModel.chatMessages.collectAsState()
    val vivaQuestions by viewModel.vivaQuestions.collectAsState()
    val codeAnalysisResult by viewModel.codeAnalysisResult.collectAsState()
    val researchResult by viewModel.researchResult.collectAsState()
    val careerResult by viewModel.careerResult.collectAsState()

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            PramanixDrawerContent(
                currentModule = currentModule,
                onSelectModule = { module ->
                    viewModel.selectModule(module)
                    scope.launch { drawerState.close() }
                },
                activeProjectName = activeProject?.name
            )
        }
    ) {
        Scaffold(
            topBar = {
                PramanixHeader(
                    currentModule = currentModule,
                    activeProjectName = activeProject?.name,
                    onOpenNav = { scope.launch { drawerState.open() } },
                    onDownloadZip = {
                        scope.launch {
                            snackbarHostState.showSnackbar(
                                "📦 Downloading repository ZIP archive for ${activeProject?.connectedRepo ?: "manthankro/pramanix-ai-"}..."
                            )
                        }
                    }
                )
            },
            snackbarHost = { SnackbarHost(snackbarHostState) },
            modifier = modifier.fillMaxSize()
        ) { innerPadding ->
            val screenModifier = Modifier.padding(innerPadding)
            when (currentModule) {
                ModuleId.GITHUB -> {
                    GithubMentorScreen(
                        repoData = repoData,
                        onConnectRepoToWorkspace = { repo ->
                            scope.launch {
                                snackbarHostState.showSnackbar("Connected $repo to active workspace!")
                            }
                        },
                        modifier = screenModifier
                    )
                }
                ModuleId.BUILDER -> {
                    ProjectBuilderScreen(
                        onAddProjectToWorkspace = { title, domain, desc, notes ->
                            viewModel.createProject(title, domain, desc, notes)
                            scope.launch {
                                snackbarHostState.showSnackbar("🚀 Project '$title' created and deployed to Workspace!")
                            }
                        },
                        modifier = screenModifier
                    )
                }
                ModuleId.WORKSPACE -> {
                    ProjectWorkspaceScreen(
                        projects = projects,
                        activeProject = activeProject,
                        onSelectProject = { id -> viewModel.selectProject(id) },
                        onAddTask = { title, priority, due, milestone ->
                            viewModel.addTask(title, priority, due, milestone)
                            scope.launch {
                                snackbarHostState.showSnackbar("Task added to roadmap.")
                            }
                        },
                        onToggleTaskStatus = { id -> viewModel.toggleTaskStatus(id) },
                        onUpdateTaskProgress = { id, p -> viewModel.updateTaskProgress(id, p) },
                        onDeleteTask = { id -> viewModel.deleteTask(id) },
                        onSaveFile = { name, content, lang ->
                            viewModel.saveFile(name, content, lang)
                            scope.launch {
                                snackbarHostState.showSnackbar("Saved $name successfully!")
                            }
                        },
                        onSaveNotes = { notes ->
                            viewModel.saveNotes(notes)
                            scope.launch {
                                snackbarHostState.showSnackbar("Engineering notes saved!")
                            }
                        },
                        modifier = screenModifier
                    )
                }
                ModuleId.TUTOR -> {
                    EngineeringTutorScreen(
                        modifier = screenModifier
                    )
                }
                ModuleId.VIVA -> {
                    DoubtVivaHelpScreen(
                        vivaQuestions = vivaQuestions,
                        onSubmitVivaAnswer = { index, ans ->
                            viewModel.submitVivaAnswer(index, ans)
                            scope.launch {
                                snackbarHostState.showSnackbar("Defense evaluated by Pramanix AI Examiner.")
                            }
                        },
                        modifier = screenModifier
                    )
                }
                ModuleId.CODING -> {
                    CodingAssistantScreen(
                        analysisResult = codeAnalysisResult,
                        isAnalyzing = isAnalyzing,
                        onAnalyzeCode = { code, mode -> viewModel.analyzeCode(code, mode) },
                        modifier = screenModifier
                    )
                }
                ModuleId.NOTES -> {
                    PdfNotesAssistantScreen(
                        modifier = screenModifier
                    )
                }
                ModuleId.RESEARCH -> {
                    ResearchAssistantScreen(
                        researchResult = researchResult,
                        isAnalyzing = isAnalyzing,
                        onGenerateResearch = { topic, style -> viewModel.generateResearch(topic, style) },
                        modifier = screenModifier
                    )
                }
                ModuleId.CAREER -> {
                    CareerPrepScreen(
                        careerResult = careerResult,
                        isAnalyzing = isAnalyzing,
                        onGenerateCareerPrep = { role, exp -> viewModel.generateCareerPrep(role, exp) },
                        modifier = screenModifier
                    )
                }
                ModuleId.CHAT -> {
                    GeneralChatScreen(
                        messages = chatMessages,
                        isAnalyzing = isAnalyzing,
                        onSendMessage = { text -> viewModel.sendChatMessage(text) },
                        modifier = screenModifier
                    )
                }
            }
        }
    }
}
